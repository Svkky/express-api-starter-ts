import { LoginResponse, EncodeRequest, Login, BaseResponse } from '../../models/authDto';
import { postgreconn } from '../config/postgresql';
const respCode = require('../appconstants/responseCodes.json');
const { generateJwtToken } = require('../services/jwthandler');
const keys = require('../appconstants/keys.json');
const secret = keys.SECRET_KEY;

async function validate_login(request: Login): Promise<LoginResponse> {
    try {
        var baseResponsData: EncodeRequest;
        console.log('login request', request);
        const query = `SELECT * FROM public.users WHERE username = '${request.username}' AND password = '${request.password}'`;

        return new Promise(async (resolve) => {
            var user = await postgreconn.query(query);
            if (user.rows.length === 0) {
                resolve({
                    responseCode: respCode.EMPTY_RESPONSE,
                    responseMessage: `invalid user : user not found`,
                    jwttoken: '',
                    issued: 0,
                    expires: 0,
                    data: null
                });
            } else {
                var value = user.rows;
                value.forEach(function (item: any) {
                    baseResponsData = {
                        username: item.username,
                        walletnumber: item.walletnumber,
                        walletbalance: item.walletbalance
                    };
                    //console.log(item.username);
                });

                const encoderequest: EncodeRequest = {
                    username: baseResponsData.username,
                    walletnumber: baseResponsData.walletnumber,
                    walletbalance: baseResponsData.walletbalance
                };
                var genToken = await generateJwtToken(secret, encoderequest);
                //var jsonresult = JSON.parse(genToken.data);
                console.log(genToken.data.jwttoken);
                resolve({
                    responseCode: respCode.STATUS_OK,
                    responseMessage: `successful : user logged in successfully`,
                    jwttoken: genToken.data.jwttoken,
                    issued: genToken.data.issued,
                    expires: genToken.data.expires,
                    data: baseResponsData
                });
            }
        });
    } catch (error) {
        return {
            responseCode: respCode.EXCEPTION_OCCURED,
            responseMessage: `Exception Occured : while validating login for user with username : ${request.username} : Error: ${error}`,
            jwttoken: '',
            issued: 0,
            expires: 0,
            data: null
        };
    }
}

async function validate_user(username: string): Promise<BaseResponse> {
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

async function get_all_users(): Promise<BaseResponse> {
    try {
        const query = `SELECT * FROM public.users ORDER BY "Id" ASC`;

        return new Promise(async (resolve) => {
            var users = await postgreconn.query(query);
            resolve({
                responseCode: respCode.STATUS_OK,
                responseMessage: `Successful : users fetched successfully`,
                data: users.rows
            });
        });
    } catch (error) {
        return {
            responseCode: respCode.EXCEPTION_OCCURED,
            responseMessage: `Exception Occured : while fetching users list, Error: ${error}`,
            data: null
        };
    }
}

// (async () => {
//     console.log(await get_user_by_username('yusufsunkanmi3@gmail.com'));
// })();

// (async () => {
//     console.log(await get_all_users());
// })();

module.exports = {
    validate_login,
    validate_user,
    get_all_users
};
