async function calculateTeamSteps(db, teamName) {
    var totalSteps = 0;
    await db.orderByChild('team').equalTo(teamName).on("value", async function (snapshot) {
        snapshot.forEach(function (data) {
            console.log(data.val())
            totalSteps += data.val().stepCount
        })
    });

    return totalSteps;
}

module.exports = {
    calculateTeamSteps,
}