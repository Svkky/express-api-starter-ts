import { Request, Response } from 'express';
import { PostTransaction } from '../../models/transactionDto';
const express = require('express');
const router = express.Router();
const respCode = require('../appconstants/responseCodes.json');
const { initiate_transaction, txndata, verify_transaction } = require('../services/txnservice');
const { verifyJwtToken } = require('../services/jwthandler');
const keys = require('../appconstants/keys.json');
const secret = keys.SECRET_KEY;

router.post('/initiate_fund_wallet_or_trf_request', async (req: Request, res: Response) => {
    try {
        var authToken = req.headers['authorization'];
        //verify token
        var valid_token = await verifyJwtToken(secret, authToken);
        if (valid_token.type !== 'valid') {
            res.send({
                responseCode: respCode.VALIDATION_ERROR,
                responseMessage: valid_token.type,
                data: null
            });
        } else {
            console.log(valid_token.email);
            var reqq: PostTransaction = {
                email: req.body.email,
                amount: req.body.amount,
                recipient: req.body.email,
                walletbalance: valid_token.walletbalance
            };
            const resp = await initiate_transaction(reqq);

            if (resp.responseCode != '200') {
                res.send({
                    responseCode: respCode.EMPTY_RESPONSE,
                    responseMessage: resp.responseMessage,
                    data: null
                });
            } else {
                resp.data = resp.data;
                res.send(resp);
            }
        }
    } catch (error) {
        res.send({
            responseCode: respCode.EXCEPTION_OCCURED,
            responseMessage: `Exception Occured : while initiating : ${error}`,
            data: null
        });
    }
});

router.get('/gettransactionbytid/:tid', async (req: Request, res: Response) => {
    try {
        var authToken = req.headers['authorization'];
        //verify token
        var valid_token = await verifyJwtToken(secret, authToken);
        if (valid_token.type !== 'valid') {
            res.send({
                responseCode: respCode.VALIDATION_ERROR,
                responseMessage: valid_token.type,
                data: null
            });
        } else {
            const resp = await txndata(req.params.tid);

            if (resp.data === undefined || resp.data.length === 0) {
                res.send({
                    responseCode: respCode.EMPTY_RESPONSE,
                    responseMessage: 'No records found.',
                    data: null
                });
            } else {
                res.send(resp);
            }
        }
    } catch (error) {
        res.send({
            responseCode: respCode.EXCEPTION_OCCURED,
            responseMessage: `Exception Occured : while fetching student : ${error}`,
            data: null
        });
    }
});

router.post('/confirmtransactionposting', async (req: Request, res: Response) => {
    try {
        var authToken = req.headers['authorization'];
        //verify token
        var valid_token = await verifyJwtToken(secret, authToken);
        if (valid_token.type !== 'valid') {
            res.send({
                responseCode: respCode.VALIDATION_ERROR,
                responseMessage: valid_token.type,
                data: null
            });
        } else {
            console.log(valid_token.email);

            const resp = await verify_transaction(req.body.reference, req.body.transactionid);

            if (resp.responseCode != '200') {
                res.send({
                    responseCode: respCode.EMPTY_RESPONSE,
                    responseMessage: `verification request failed : ${resp.responseMessage}`,
                    data: null
                });
            } else {
                resp.data = resp.data;
                res.send(resp);
            }
        }
    } catch (error) {
        res.send({
            responseCode: respCode.EXCEPTION_OCCURED,
            responseMessage: `Exception Occured : while verifying : ${error}`,
            data: null
        });
    }
});

export default { router };
