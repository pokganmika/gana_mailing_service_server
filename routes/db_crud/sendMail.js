const fs = require('fs')
var api_key = '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';
var sgMail = require('@sendgrid/mail');
sgMail.setApiKey(api_key);
var resultFile = fs.createWriteStream('emailResult.txt');
var email_template = fs.readFileSync('email-template.html').toString()


///aws
var AWS = require('aws-sdk');
// Set the region
AWS.config.update({ region: 'us-west-2' });

//TODO: aws config! (.env?)
// var awsConfig = {
//     region: 'us-west-2',
//     endpoint: 'http://dynamodb.us-east-1.amazonaws.com',
//     accessKeyId: '',
//     secretAccessKey: ''
// };

// AWS.config.update(awsConfig);

var TableName = "SubscribeTable"
var docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
var dynamodb = new AWS.DynamoDB();
///aws
//함수
var DBSCAN = function (params) {
    var lastEvaluatedKey = {};
    var previous_items = [];
    return new Promise(function (resolve, reject) {
        function moreScan() {
            if (Object.keys(lastEvaluatedKey).length) {
                params.ExclusiveStartKey = lastEvaluatedKey
            }
            docClient.scan(params, function (err, data) {
                if (err) {
                    reject(err)
                }
                if (data != null) {
                    previous_items = previous_items.concat(data.Items)
                    if (data.LastEvaluatedKey) {
                        lastEvaluatedKey = data.LastEvaluatedKey
                        moreScan()
                    } else {
                        resolve(previous_items);
                    }
                    console.log('결과 ' + data.Count)
                } else {
                    reject('err')
                }

            })
        }
        moreScan();
    }).catch(function (e) {
        console.log(e)
    })
};

function clone(obj) {
    if (obj === null || typeof (obj) !== 'object')
        return obj;

    var copy = obj.constructor();

    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) {
            copy[attr] = clone(obj[attr]);
        }
    }

    return copy;
}
///수정할부분
var mail_header = {
    to: '',
    from: 'GanaProject <no-reply@ganacoin.io>',//수정할부분
    subject: '"835M" GANA Token Burn (GANA의 토큰 소각이 진행됩니다.)',//수정할부분
    text: '"835M" GANA Token Burn (GANA의 토큰 소각이 진행됩니다.)',//수정할부분
    html: email_template.replace("[Unsubscribe]", "<%asm_group_unsubscribe_raw_url%>"),
    asm: {
        group_id: 6179
    }
};
////수정할 부분 끝
var mailing_array = []
let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
return new Promise(function (resolve, reject) {
    resolve(DBSCAN({
        TableName: "SubscribeTable"
        // TableName: "SubscribeTableV2"
        // TableName: "UnSubscribeTable"
    }))
}).then(function (_object) {
    _object.forEach(function (el) {
        if (re.test(el.email)) {
            console.log(el.email)
            let mail_header_copy = clone(mail_header)
            mail_header_copy.to = el.email
            mailing_array.push(mail_header_copy)
        }
    })
	//테스트시 사용하는 코드 전체 주석 풀기
    var test_header = clone(mailing_array[0])
    test_header.to = "spicarian@gmail.com"//email  주소
    sgMail.send(test_header, function (error, result) {
        if (error) {
            console.log(error+'\r\n')
        } else {
            console.log('메일보내기 성공\r\n')
        }
    });
    
    sgMail.send(mailing_array, function (error, result) {
        if (error) {
            console.log(error+'\r\n')
        } else {
            console.log('메일보내기 성공\r\n')
        }
    });
	//실제 사용시 주석풀기

    // _object == 모든 subscriber들
})
