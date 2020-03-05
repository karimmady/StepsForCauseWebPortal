/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Provide authentication credentials to your application code by setting the environment variable GOOGLE_APPLICATION_CREDENTIALS
// in order for bigquery to work.** export GOOGLE_APPLICATION_CREDENTIALS="/home/user/Downloads/[FILE_NAME].json" **
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const express = require('express');
const cors = require('cors');
const helmet = require("helmet");
const bodyParser = require('body-parser');
const app = express();
const admin = require("firebase-admin");
const serviceAccount = require("./steps-for-cause-firebase-adminsdk-hnxxk-70b972bec0.json");
const utils = require("./utils");
const { BigQuery } = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://steps-for-cause.firebaseio.com"
});
const db = admin.firestore();

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
        });

        await db.collection('users').doc(user.uid).set({
            'uid': user.uid,
            'email': user.email,
            'stepCount': req.body.stepCount,
            'name': req.body.firstName + " " + req.body.lastName,
            'isAdmin': true
        });

        await db.collection('admins').doc(user.uid).set({
            'uid': user.uid
        });
    } catch (err) {
        res.status(500).send(err);
    }
    res.status(200).send(user);
});

app.post('/users', async (req, res) => {
    try {
        var user = await admin.auth().createUser({
            email: req.body.email,
            emailVerified: true,
            password: req.body.password,
        });

        await db.collection('users').doc(user.uid).set({
            'uid': user.uid,
            'email': user.email,
            'stepCount': req.body.stepCount,
            'name': req.body.firstName + " " + req.body.lastName,
            'isAdmin': false
        });
    } catch (err) {
        res.status(500).send(err);
    }
    res.status(200).send(user);
});

app.put('/users', async (req, res) => {
    db.collection('users').doc(req.body.id).get().then(user => {
        if (!user.exists) {
            db.collection('teams').doc(req.body.team).get().then(team => {
                team.ref.collection('members').doc(req.body.id).get().then(user => {
                    if (!user.exists)
                        throw ({ "code": "auth/id not found", "message": "The id does not exist or has been deleted" });
                    else {
                        let data = user.data();
                        let newSteps = +data.stepCount + +req.body.addedStepCount;
                        if (isNaN(newSteps))
                            throw ({ "code": "type/invalid step count", "message": "The step count entered is of an invalid data type" });
                        else {
                            user.ref.update({
                                'stepCount': newSteps
                            });
                            let data = team.data();
                            let newStepsTeam = +data.totalSteps + +req.body.addedStepCount

                            team.ref.update({
                                'totalSteps': newStepsTeam
                            })
                            res.status(200).send({ "message": "Steps updated" });
                        }
                    }
                }).catch(err => {
                    res.status(500).send(err);
                })
            })
        } else {
            let data = user.data();
            let newSteps = +data.stepCount + +req.body.addedStepCount
            if (isNaN(newSteps))
                throw ({ "code": "type/invalid step count", "message": "The step count entered is of an invalid data type" });
            else {
                user.ref.update({
                    'stepCount': newSteps
                })
                res.status(200).send({ "message": "Steps updated" });
            }
        }
    }).catch(err => {
        res.status(500).send(err);
    });
})

app.put('/users/change-isAdmin', async (req, res) => {
    db.collection('users').doc(req.body.id).get().then(user => {
        if (!user.exists) {
            db.collection('teams').doc(req.body.team).collection('members').doc(req.body.id).get().then(user => {
                if (!user.exists)
                    throw ({ "code": "auth/id not found", "message": "The id does not exist or has been deleted" });
                else {
                    user.ref.update({
                        'isAdmin': req.body.isAdmin
                    })
                    if (req.body.isAdmin) {
                        db.collection('admins').doc(user.data().uid).set({
                            'uid': user.data().uid
                        });
                    } else {
                        db.collection('admins').doc(user.data().uid).delete();
                    }
                    res.status(200).send({ "message": "User updated" });
                }
            });
        } else {
            user.ref.update({
                'isAdmin': req.body.isAdmin
            })
            if (req.body.isAdmin) {
                db.collection('admins').doc(user.data().uid).set({
                    'uid': user.data().uid
                });
            } else {
                db.collection('admins').doc(user.data().uid).delete();
            }
            res.status(200).send({ "message": "User updated" });
        }
    }).catch(err => {
        res.status(500).send(err);
    });
})

app.delete('/users', async (req, res) => {
    admin.auth().deleteUser(req.query.id).then(() => {
        db.collection('users').doc(req.query.id).get().then(user => {
            if (user.exists) {
                if (user.data().isAdmin)
                    db.collection('admins').doc(user.id).delete();
                user.ref.delete();
                res.status(200).send({ 'message': 'User deleted' });
            } else
                throw "invalid"
        }).catch(err => {
            db.collectionGroup('members').where('uid', '==', req.query.id).get().then(users => {
                if (users.empty)
                    throw ({ "code": "auth/id not found", "message": "The id does not exist or has been deleted" });
                else {
                    users.forEach(user => {
                        let teamID = user.data().team;
                        db.collection('teams').doc(teamID).get().then(team => {
                            let newSteps = team.data().totalSteps - user.data().stepCount
                            team.ref.update({
                                'totalSteps': newSteps
                            })
                        })
                        if (user.data().isAdmin)
                            db.collection('admins').doc(user.id).delete();
                        user.ref.delete();
                        res.status(200).send({ 'message': 'User deleted' });
                    })
                }
            }).catch(err => {
                res.status(500).send(err);
            })
        })
    }).catch(err => {
        res.status(500).send(err);
    })
})

app.post('/teams', async (req, res) => {
    db.collection('teams').where('teamName', '==', req.body.teamName).get().then(teams => {
        if (teams.empty) {
            db.collection('teams').add({
                'teamName': req.body.teamName,
                'totalSteps': 0
            }).then(() => {
                res.status(200).send({ "message": "Team created" });
            })
        } else
            throw ({ "code": "duplicate/team exists", "message": "A team with the selected name already exists, please select a unique name" });
    }).catch(err => {
        res.status(500).send(err);
    })
})

app.put('/teams/add-user', async (req, res) => {
    try {
        if (!req.body.team)
            throw ({ "code": "auth/team doesnt exist", "message": "A team with the selected name does not exist, please make sure the team name is correct" });
        else {
            db.collection('teams').doc(req.body.team).get().then(team => {
                if (team.exists) {
                    let userRef = db.collection('users').doc(req.body.id);
                    let user;
                    userRef.get().then(u => {
                        if (u.exists) {
                            user = u.data();
                            user['team'] = team.id
                        } else
                            throw ({ "code": "auth/user doesnt exist", "message": "The users with the selected id either does not exist or is already in a team" });

                        team.ref.collection('members').doc(user.uid).set(user);
                        let newTotalSteps = +team.data().totalSteps + +user.stepCount;
                        team.ref.update({
                            'totalSteps': newTotalSteps
                        });

                        userRef.delete();
                        res.status(200).send({ "message": "User added to team" });
                    }).catch(err => {
                        res.status(500).send(err);
                    })
                }
                else
                    throw ({ "code": "auth/team doesnt exist", "message": "A team with the selected name does not exist, please make sure the team name is correct" });
            }).catch(err => {
                res.status(500).send(err);
            })
        }
    } catch (err) {
        res.status(500).send(err);
    }
})

app.put('/teams/remove-user', async (req, res) => {
    db.collection('teams').doc(req.body.team).collection('members').doc(req.body.id).get().then(user => {
        if (!user.exists)
            throw ({ "code": "auth/user doesnt exist", "message": "The users with the selected id either does not exist or is already in a team" });
        else {
            let userData = user.data();
            db.collection('teams').doc(req.body.team).get().then(team => {
                let teamData = team.data();
                let newTotalSteps = teamData.totalSteps - userData.stepCount;
                db.collection('teams').doc(req.body.team).update({
                    'totalSteps': newTotalSteps
                }).then(() => {
                    delete userData.team;
                    db.collection('teams').doc(req.body.team).collection('members').doc(req.body.id).delete();
                    db.collection('users').doc(req.body.id).set(userData);
                })
            });
            res.status(200).send({ 'message': 'User removed' });
        }
    }).catch(err => {
        res.status(500).send(err);
    })
})

app.delete('/teams', async (req, res) => {
    db.collection('teams').doc(req.query.team).get().then(team => {
        if (team.exists) {
            team.ref.collection('members').get().then(async users => {
                let batch = db.batch();
                users.docs.forEach(user => {
                    admin.auth().deleteUser(user.data().uid);
                    if (user.data().isAdmin)
                        db.collection('admins').doc(user.id).delete();
                    batch.delete(user.ref);
                })

                batch.delete(team.ref);
                await batch.commit();
                res.status(200).send({ 'message': 'Team deleted' })
            }).catch(err => {
                res.status(500).send(err);
            })
        } else
            throw ({ "code": "auth/team doesnt exist", "message": "A team with the selected name already does not exist, please make sure the team name is correct" });
    }).catch(err => {
        res.status(500).send(err);
    })
})

app.get('/table', async (req, res) => {
    var data
    try {
        await bigquery.query('SELECT * FROM `steps-for-cause.analytics_221430045.country`').then(
            response => data = response
        )
        res.status(200).send(data)
        return
    } catch (error) {
        res.sendStatus(500)
        return
    }
})


app.get('/teams', async (req, res) => {
    let allTeams = [];

    await db.collection('teams').get().then(async teams => {
        var allTeamPromises = await teams.docs.map(async team => {
            let teamData = team.data();
            teamData['users'] = [];
            var userPromise = await team.ref.collection('members').get().then(users => {
                users.forEach(user => {
                    teamData.users.push(user.data());
                })
            }).then(() => {
                allTeams.push(teamData);
                return allTeams;
            })
            await Promise.all(userPromise);
            return allTeams;
        })

        await Promise.all(allTeamPromises);
        res.status(200).send({ 'data': allTeams })
    });
})

app.listen(3000, () => console.log('Express server running on port 3000'));