function count_votes (votes) {
    const votes_keys = Object.keys(votes)
    const random = Math.floor(Math.random() * votes_keys.length);
    const random_key = votes_keys[random]

    var most_voted = votes[random_key]
    var votes_by_game = {}
    for (let i of Object.keys(votes)) {
        const game = votes[i]
        votes_by_game[game] = !votes_by_game[game] ? 1 : votes_by_game[game] + 1
        
        if (votes_by_game[game] >= votes_by_game[most_voted]) {
            most_voted = game
        }
    }
    return {votes_by_game, most_voted}
}

module.exports =  { count_votes }