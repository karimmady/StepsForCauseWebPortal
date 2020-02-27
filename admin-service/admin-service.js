const express = require('express');
const cors = require('cors');
const helmet = require("helmet");
const bodyParser = require('body-parser');
const app = express();
const admin = require("firebase-admin");
const serviceAccount = require("./steps-for-cause-firebase-adminsdk-hnxxk-ef03407863.json");
const utils = require("./utils");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://steps-for-cause.firebaseio.com"
});
const db = admin.database().ref('/users');

app.use(bodyParser.json({ limit: '160mb', extended: true }));
app.use(helmet());
app.use(cors());

app.get("/", (req, res) => {
    res.status(200).send("Server is up");
});

app.post('/admins', async (req, res) => {
    try {
        var user = await admin.auth().createUser({
            email: req.body.email,
            emailVerified: true,
            password: req.body.password,
        })

        await db.child(user.uid).update({
            'uid': user.uid,
            'email': user.email,
            'stepCount': req.body.stepCount,
            'name': req.body.firstName + " " + req.body.lastName,
            'isAdmin': true
        })
    } catch (err) {
        res.status(500).send(err)
    }
    res.status(200).send(user)
});

app.post('/users', async (req, res) => {
    try {
        var user = await admin.auth().createUser({
            email: req.body.email,
            emailVerified: true,
            password: req.body.password,
        })

        await db.child(user.uid).update({
            'uid': user.uid,
            'email': user.email,
            'stepCount': req.body.stepCount,
            'name': req.body.firstName + " " + req.body.lastName,
            'isAdmin': false
        })
    } catch (err) {
        res.status(500).send(err)
    }
    res.status(200).send(user)
});

app.put('/users', async (req, res) => {
    db.orderByChild("email").equalTo(req.body.email).once("value", async function (snapshot) {
        try {
            if (snapshot.exists()) {
                const uid = Object.keys(snapshot.val())[0];
                await db.child(uid).update({ 'stepCount': +snapshot.val()[uid].stepCount + +req.body.addedStepCount })
                    .finally(() => {
                        res.status(200).send({ "message": "Steps updated" });
                    })
            } else
                res.status(404).send({ "code": "auth/email not found", "message": "The email does not exist or has been deleted" });
        } catch (err) {
            res.status(500).send({ "code": "type/invalid step count", "message": "The step count entered is of an invalid data type" });
        }
    })
})

app.put('/users/change-isAdmin', async (req, res) => {
    db.orderByChild("email").equalTo(req.body.email).once("value", async function (snapshot) {
        try {
            if (snapshot.exists()) {
                const uid = Object.keys(snapshot.val())[0];
                await db.child(uid).update({ 'isAdmin': req.body.isAdmin })
                    .finally(() => {
                        res.status(200).send({ "message": "User updated" });
                    })
            } else
                res.status(404).send({ "code": "auth/email not found", "message": "The email does not exist or has been deleted" });
        } catch (err) {
            res.status(500).send({ "code": "500", "message": "Internal server error" });
        }
    })
})

app.delete('/users', async (req, res) => {
    await admin.auth().deleteUser(req.query.id)
        .then(async () => {
            await db.child(req.query.id).remove().then(() => {
                res.status(200).send({ "message": "User deleted" })
            }).catch(err => {
                res.status(500).send(err);
            })
        }).catch(err => {
            res.status(500).send(err);
        });
})

app.post('/teams', async (req, res) => {
    const teamdb = admin.database().ref('/teams');
    var teamExisits = false;
    await teamdb.orderByChild('teamName').equalTo(req.body.teamName).once("value", async function (snapshot) {
        try {
            if (snapshot.exists()) {
                const team_id = Object.keys(snapshot.val())[0]
                throw "The team name you have chosen is already in user by some other team";
            }
        } catch (err) {
            teamExisits = true;
            res.status(400).send({ "code": "auth/team exists", "message": err });
        }
    })
        .then(async () => {
            if (!teamExisits) {
                const ref = await teamdb.push();
                await ref.update({ "teamName": req.body.teamName, "users": [] });
                res.status(200).send({ "message": "Team created" });
            }
        })
})

app.put('/teams/add-user', async (req, res) => {
    const teamdb = admin.database().ref('/teams');
    let user
    let uid
    var userInTeam = false;
    var userExists = true;
    await db.orderByChild('email').equalTo(req.body.email).once("value", async function (snapshot) {
        if (snapshot.exists()) {
            uid = Object.keys(snapshot.val())[0];
            user = snapshot.val()[uid]
            try {
                if (snapshot.val()[uid].team) {
                    throw "This user is already in a team, if you would like to change that then please remove the user from their current team first"
                }
            } catch (err) {
                userInTeam = true;
                res.status(400).send({ "code": "auth/user in team", "message": err });
            }
        } else {
            userExists = false;
            res.status(400).send({ "code": "auth/email not found", "message": "The email does not exist or has been deleted" })
        }
    })

    if (userExists && !userInTeam) {
        await teamdb.orderByChild('teamName').equalTo(req.body.teamName).once("value", async function (snapshot) {
            if (snapshot.exists()) {
                const team_id = Object.keys(snapshot.val())[0];
                var users = snapshot.val()[team_id].users;
                if (users) {
                    users.push(user);
                } else {
                    users = [];
                    users.push(user);
                }
                await db.child(uid).update({ "team": req.body.teamName }).then(async () => {
                    await teamdb.child(team_id).update({ "users": users }).then(async () => {
                        res.status(200).send({ "message": "Team updated" });
                    })
                })
            } else {
                res.status(404).send({ "code": "auth/team not found", "message": "The team does not exist or has been deleted" });
            }
        })
    }
})

app.put('/teams/remove-user', async (req, res) => {
    const teamdb = admin.database().ref('/teams');
    let uid
    let user
    var userInTeam = true;
    var userExists = true;
    await db.orderByChild('email').equalTo(req.body.email).once("value", async function (snapshot) {
        if (snapshot.exists()) {
            uid = Object.keys(snapshot.val())[0];
            user = snapshot.val()[uid];
            try {
                if (!snapshot.val()[uid].team) {
                    throw "This user does not have a team"
                }
            } catch (err) {
                userInTeam = false;
                res.status(400).send({ "code": "auth/user not in team", "message": err });
            }
        } else {
            userExists = false;
            res.status(400).send({ "code": "auth/email not found", "message": "The email does not exist or has been deleted" })
        }
    })

    if (userExists && userInTeam) {
        await teamdb.orderByChild('teamName').equalTo(req.body.teamName).once("value", async function (snapshot) {
            try {
                if (snapshot.exists()) {
                    const team_id = Object.keys(snapshot.val())[0];
                    var users = snapshot.val()[team_id].users;

                    const userToRemoveIndex = users.map(function (u) {
                        return u.email;
                    }).indexOf(user.email)

                    if (userToRemoveIndex > -1) {
                        users.splice(userToRemoveIndex, 1);
                    } else {
                        throw "The user does not exist in this team"
                    }
                    await teamdb.child(team_id).update({ "users": users });
                    await db.child(uid).child('team').remove()
                        .then(() => {
                            res.status(200).send({ "message": "User removed" });
                        })
                } else {
                    res.status(404).send({ "code": "auth/team not found", "message": "The team does not exist or has been deleted" });
                }
            } catch (err) {
                res.status(400).send({ "code": "auth/user not in team", "message": err });
            }
        })
    }
})

app.delete('/teams', async (req, res) => {
    const teamdb = admin.database().ref('/teams');

    await teamdb.orderByChild('teamName').equalTo(req.query.teamName).once("value", async function (snapshot) {
        try {
            if (snapshot.exists()) {
                db.orderByChild('team').equalTo(req.query.teamName).on("value", async function (snapshot) {
                    snapshot.forEach(async function (data) {
                        await db.child(data.key).child("team").remove();
                    })
                })
                const team_id = Object.keys(snapshot.val())[0];

                await teamdb.child(team_id).remove()
                    .then(() => {
                        res.status(200).send({ "message": "Team deleted" });
                    })
            } else
                res.status(404).send({ "code": "auth/team not found", "message": "The team does not exist or has been deleted" });
        } catch (err) {
            res.status(404).send({ "code": "auth/500", "message": "Internal server error" });
        }
    });
})

app.get('/teams', async (req, res) => {
    const teamdb = admin.database().ref('/teams');
    var teams = [];
    var temp = [];
    var teamIDs = [];
    var i = 0;
    await teamdb.once("value", function (data) {
        try {
            teams = Object.values(data.toJSON());
            teamIDs = Object.keys(data.toJSON());
            temp = teams.map(async team => {
                var totalSteps = 0;
                var users = [];
                var updatedUsers = [];

                try {
                    users = Object.values(team.users)
                    var steps = await users.map(async u => {
                        await db.orderByChild('email').equalTo(u.email).once("value", function (snapshot) {
                            totalSteps += snapshot.val()[u.uid].stepCount
                            updatedUsers.push(snapshot.val()[u.uid])
                            return totalSteps;
                        })
                    })
                    await Promise.all(steps);

                    var obj = {
                        "teamName": team.teamName,
                        "users": updatedUsers,
                        "totalSteps": totalSteps
                    }
                    await teamdb.child(teamIDs[i++]).update({ "users": updatedUsers })
                    return obj

                } catch (err) {
                    var obj = {
                        "teamName": team.teamName,
                        "users": updatedUsers,
                        "totalSteps": totalSteps
                    }
                    await teamdb.child(teamIDs[i++]).update({ "users": updatedUsers })
                    return obj;
                }
            })
        } catch (err) { }
    }).then(async () => {
        var result = await Promise.all(temp);
        res.status(200).send({ "data": result })
    })
})

app.listen(3000, () => console.log('Express server running on port 3000'));