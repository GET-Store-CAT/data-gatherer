const dotenv = require('dotenv');
require('dotenv').config();
const TwitterTask = require('../twitter-task');
const { TweetUserMentionTimelineV2Paginator } = require('twitter-api-v2');

// warning, this doesn't really work that well, but it's a start


const run = async () => {

    round = 0;

    twitterTask = await new TwitterTask (async() => {
        return round;
    });
    console.log('started a new crawler at round', round);

    let cid = "bafybeidbeuy3olx5lw44muzho5ndt7xyqtlqilkucousxpdlyepkgaox6u";
    let output = await twitterTask.validate(cid, round);
    console.log('validated round result', output);
    
}


run ()
