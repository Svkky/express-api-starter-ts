import { postgreconn } from '../config/postgresql';
import { encode, TAlgorithm } from 'jwt-simple';
import { decode } from 'jwt-simple';
import { Session, EncodeResult, EncodeResultData, EncodeRequest, DecodeResult, BaseResponse } from '../../models/authDto';
const respCode = require('../appconstants/responseCodes.json');
const keys = require('../appconstants/keys.json');
const secret = keys.SECRET_KEY;
const algorithmKey = keys.TALGORITHM_KEY;

export function generateJwtToken(secretKey: string, request: EncodeRequest): EncodeResult {
    try {
        var serializedpayload = JSON.stringify(request);
        //console.log(serializedpayload);
        //use HS512 to sign the token
        const algorithm: TAlgorithm = algorithmKey;

        // Determine when the token should expire
        const issued = Date.now();
        const fifteenMinutesInMs = 30 * 60 * 1000;
        const expires = issued + fifteenMinutesInMs;

        const session: Session = {
            request: serializedpayload,
            issued: issued,
            expires: expires
        };

        var jwttoken = encode(session, secretKey, algorithm);

        const psession: EncodeResultData = {
            jwttoken: jwttoken,
            issued: issued,
            expires: expires
        };

        if (jwttoken && jwttoken !== '') {
            return {
                responseCode: respCode.STATUS_OK,
                responseMessage: `authorized`,
                data: psession
            };
        }
        return {
            responseCode: respCode.VALIDATION_ERROR,
            responseMessage: `unauthorized`,
            data: null
        };
    } catch (error) {
        return {
            responseCode: respCode.VALIDATION_ERROR,
            responseMessage: `unauthorized : ${error}`,
            data: null
        };
    }
}

export async function verifyJwtToken(secretKey: string, tokenString: string): Promise<DecodeResult> {
    //sign token
    const algorithm: TAlgorithm = algorithmKey;

    let result: Session = {
        request: '',
        issued: 0,
        expires: 0
    };

    try {
        result = decode(tokenString, secretKey, false, algorithm);
        var jsonresult = JSON.parse(result.request);

        var valid_user = await verify_user(jsonresult.username);
        if (valid_user.responseCode == '200') {
            return {
                type: 'valid',
                username: jsonresult.username,
                walletnumber: jsonresult.walletnumber,
                walletbalance: jsonresult.walletbalance
            };
        } else {
            return {
                type: `invalid`,
                username: '',
                walletnumber: '',
                walletbalance: 0
            };
        }
    } catch (_e) {
        return {
            type: `invalid token ex : ${_e}`,
            username: '',
            walletnumber: '',
            walletbalance: 0
        };
    }
}

async function verify_user(username: string): Promise<BaseResponse> {
    try {
        const query = `SELECT * FROM public.users WHERE username = '${username}'`;

        return new Promise(async (resolve) => {
            var user = await postgreconn.query(query);
            if (user.rows.length === 0) {
                resolve({
                    responseCode: respCode.EMPTY_RESPONSE,
                    responseMessage: `invalid user : not found`,
                    data: null
                });
            } else {
                resolve({
                    responseCode: respCode.STATUS_OK,
                    responseMessage: `successful : valid user`,
                    data: user.rows
                });
            }
        });
    } catch (error) {
        return {
            responseCode: respCode.EXCEPTION_OCCURED,
            responseMessage: `Exception Occured : while validating user with username : ${username}, Error: ${error}`,
            data: null
        };
    }
}

module.exports = {
    generateJwtToken,
    verifyJwtToken
};

// (async () => {
//     const request: EncodeRequest = {
//         username: 'yusufsunkanmi3@gmail.com',
//         walletnumber: '8145209317',
//         walletbalance: 0
//     };
//     console.log(request);
//     console.log(await generateJwtToken(secret, request));
// })();
// (async () => {
//     const request =
//         'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJyZXF1ZXN0Ijoie1widXNlcm5hbWVcIjpcInl1c3Vmc3Vua2FubWkzQGdtYWlsLmNvbVwiLFwid2FsbGV0bnVtYmVyXCI6XCI4MTQ1MjA5MzE3XCIsXCJ3YWxsZXRiYWxhbmNlXCI6MH0iLCJpc3N1ZWQiOjE2NjIwMTY2NTQ5MjQsImV4cGlyZXMiOjE2NjIwMTg0NTQ5MjR9.T6Bo0IIJLKoRwE6biWrNTAs9SJogWwRa8ydrQi7QXr0D3DYFuG7-jTd3gCRGnLj7RWS3ukRDLhYvDHR61WlyNQ';
//     console.log(await verifyJwtToken(secret, request));
// })();
