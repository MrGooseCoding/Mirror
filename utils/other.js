const { generate_random_integer } = require('./generators')

function count_votes (votes) {
    const votes_keys = Object.keys(votes)
    const random_integer = generate_random_integer(0, votes_keys.length)
    const random_key = votes_keys[random_integer]

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

function shuffle_array(original_array) {
    let array = original_array
    let currentIndex = original_array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array
}

module.exports =  { count_votes, shuffle_array }