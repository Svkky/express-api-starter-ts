import { BaseResponse, Guid } from '../../models/authDto';
import { ApiResponse, PersistTransaction, PostTransaction, PostTransactionResp, PostTransactionRespData } from '../../models/transactionDto';
import { postgreconn } from '../config/postgresql';
const respCode = require('../appconstants/responseCodes.json');
const keys = require('../appconstants/keys.json');
const secret = keys.PSTACK_SECRET_KEY;

async function initiate_transaction(request: PostTransaction): Promise<ApiResponse> {
    try {
        var Tid = Guid.newGuid();

        return new Promise(async (resolve) => {
            var resp = await post_transaction(request, Tid);
            if (resp.responseCode != '200') {
                resolve({
                    transactionId: Tid,
                    responseCode: respCode.EMPTY_RESPONSE,
                    responseMessage: resp.responseMessage,
                    data: null
                });
            } else {
                resolve({
                    transactionId: Tid,
                    responseCode: respCode.STATUS_OK,
                    responseMessage: `transaction successful.`,
                    data: null
                });
            }
        });
    } catch (error) {
        return {
            transactionId: '',
            responseCode: respCode.EXCEPTION_OCCURED,
            responseMessage: `Exception Occured : while posting txn with username : ${request.email}, Error: ${error}`,
            data: null
        };
    }
}

async function post_transaction(request: PostTransaction, TId: string): Promise<ApiResponse> {
    try {
        if (request.amount == '' || request.email == '' || request.amount == undefined || request.email == undefined) {
            var baseresp: ApiResponse = {
                transactionId: '',
                responseCode: respCode.EMPTY_RESPONSE,
                responseMessage: `user email and transaction amount is required`,
                data: ''
            };
            return baseresp;
        } else {
            console.log('transaction request', request);
            const https = require('https');
            const _request = JSON.stringify(request);

            var persist: PersistTransaction;
            const options = {
                hostname: 'api.paystack.co',
                port: 443,
                path: '/transaction/initialize',
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${secret}`,
                    'Content-Type': 'application/json'
                }
            };

            const req = https
                .request(options, (res: any) => {
                    let data = '';
                    res.on('data', (chunk: any) => {
                        data += chunk;
                        console.log(`Data : ${data}`);
                    });

                    res.on('end', async () => {
                        //console.log(JSON.parse(data));

                        let respp: PostTransactionResp = JSON.parse(data);

                        let resppstr = JSON.stringify(respp.data);
                        let resppdata: PostTransactionRespData = JSON.parse(resppstr);

                        persist = {
                            username: request.email,
                            amount: request.amount,
                            authorization_url: resppdata.authorization_url,
                            access_code: resppdata.access_code,
                            reference: resppdata.reference,
                            tid: TId,
                            recipient: request.recipient
                        };
                        await persist_transaction(persist);
                    });
                })
                .on('error', (error: any) => {
                    console.error(`Error : ${error}`);
                });

            req.write(_request);

            req.end();

            var baseresp: ApiResponse = {
                transactionId: TId,
                responseCode: respCode.STATUS_OK,
                responseMessage: `transaction posted successfully`,
                data: _request
            };
            return baseresp;
        }

        //return baseresp;
    } catch (error) {
        return {
            transactionId: '',
            responseCode: respCode.EXCEPTION_OCCURED,
            responseMessage: `Exception Occured : while posting : username : ${request.email}, Error: ${error}`,
            data: null
        };
    }
}

async function persist_transaction(request: PersistTransaction) {
    try {
        const query = `INSERT INTO public.transactions(
	"Id", username, amount, authorization_url, access_code, reference, status, gateway_response, currency, transaction_date, "transaction_Id", recipient)
	VALUES (DEFAULT,'${request.username}' , '${request.amount}', '${request.authorization_url}', '${request.access_code}', 
    '${request.reference}', DEFAULT, '-', '-', DEFAULT, '${request.tid}', '${request.recipient}')`;

        return new Promise(async (resolve) => {
            var user = await postgreconn.query(query);
            if (user.rows.length === 0) {
                resolve({
                    responseCode: respCode.EMPTY_RESPONSE,
                    responseMessage: `transation posted with error : incomplete processing : kindly contact system admin`,
                    data: null
                });
            } else {
                resolve({
                    responseCode: respCode.STATUS_OK,
                    responseMessage: `transaction successful.`,
                    data: user.rows
                });
                console.log('we got here');
            }
        });
    } catch (error) {
        return {
            responseCode: respCode.EXCEPTION_OCCURED,
            responseMessage: `Exception Occured : while persist with username : ${request.username}, Error: ${error}`,
            data: null
        };
    }
}

async function txndata(tid: string) {
    try {
        const query = `SELECT * FROM public.transactions WHERE "transaction_Id" = '${tid}'`;

        return new Promise(async (resolve) => {
            var txn = await postgreconn.query(query);
            resolve({
                responseCode: respCode.STATUS_OK,
                responseMessage: `Transaction Successful.`,
                data: txn.rows
            });
        });
    } catch (error) {
        return {
            responseCode: respCode.EXCEPTION_OCCURED,
            responseMessage: `Exception Occured : Error: ${error}`,
            data: null
        };
    }
}

async function verify_transaction(ref: string, TId: string): Promise<ApiResponse> {
    try {
        console.log('verify request', ref);
        const https = require('https');
        const options = {
            hostname: 'api.paystack.co',
            port: 443,
            path: `/transaction/verify/${ref}`,
            method: 'GET',
            headers: {
                Authorization: 'Bearer SECRET_KEY'
            }
        };

        https
            .request(options, (res: any) => {
                let data = '';

                res.on('data', (chunk: any) => {
                    data += chunk;
                    console.log('Datta :', data);
                });

                res.on('end', () => {
                    console.log(JSON.parse(data));
                });
            })
            .on('error', (error: any) => {
                console.error(error);
            });

        var baseresp: ApiResponse = {
            transactionId: TId,
            responseCode: respCode.ERROR_OCCURED,
            responseMessage: `transaction verification dev still in progress`,
            data: ''
        };
        return baseresp;
    } catch (error) {
        return {
            transactionId: '',
            responseCode: respCode.EXCEPTION_OCCURED,
            responseMessage: `Exception Occured : while verifying : ref : ${ref}, Error: ${error}`,
            data: null
        };
    }
}

async function update_transaction(tid: string, stat: string) {
    try {
        const query = `UPDATE public.transactions SET status='${stat}'	WHERE "transaction_Id"='${tid}'`;

        return new Promise(async (resolve) => {
            var user = await postgreconn.query(query);
            if (user.rows.length === 0) {
                resolve({
                    responseCode: respCode.EMPTY_RESPONSE,
                    responseMessage: `transation upd with error : incomplete processing : kindly contact system admin`,
                    data: null
                });
            } else {
                resolve({
                    responseCode: respCode.STATUS_OK,
                    responseMessage: `transaction successful.`,
                    data: user.rows
                });
            }
        });
    } catch (error) {
        return {
            responseCode: respCode.EXCEPTION_OCCURED,
            responseMessage: `Exception Occured : while upd with tid : ${tid}, Error: ${error}`,
            data: null
        };
    }
}

async function update_balance(username: string, amount: string) {
    try {
        const query = `UPDATE public.users SET walletbalance='${amount}'	WHERE username='${username}'`;

        return new Promise(async (resolve) => {
            var user = await postgreconn.query(query);
            if (user.rows.length === 0) {
                resolve({
                    responseCode: respCode.EMPTY_RESPONSE,
                    responseMessage: `balance upd with error : incomplete processing : kindly contact system admin`,
                    data: null
                });
            } else {
                resolve({
                    responseCode: respCode.STATUS_OK,
                    responseMessage: `transaction successful.`,
                    data: user.rows
                });
            }
        });
    } catch (error) {
        return {
            responseCode: respCode.EXCEPTION_OCCURED,
            responseMessage: `Exception Occured : while upd with username : ${username}, Error: ${error}`,
            data: null
        };
    }
}

// (async () => {
//     console.log(await verify_transaction('8f5g3gpvyz', '3af628a8-bfd5-477d-92cf-432cfbb06f96'));
// })();

module.exports = {
    initiate_transaction,
    txndata,
    verify_transaction,
    update_transaction,
    update_balance
};
