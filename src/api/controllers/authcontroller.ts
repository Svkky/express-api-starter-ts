import { Request, Response } from 'express';
import { Login } from '../../models/authDto';
const express = require('express');
const router = express.Router();
const respCode = require('../appconstants/responseCodes.json');
const { validate_login, get_all_users } = require('../services/userservice');
const { verifyJwtToken } = require('../services/jwthandler');
const keys = require('../appconstants/keys.json');
const secret = keys.SECRET_KEY;

router.post('/login', async (req: Request, res: Response) => {
    try {
        if (req.body !== undefined && req.body.password && req.body !== null) {
            var loginrequest: Login = {
                username: req.body.username,
                password: req.body.password
            };

            const resp = await validate_login(loginrequest);

            if (resp.responseCode != '200') {
                res.send({
                    responseCode: respCode.EMPTY_RESPONSE,
                    responseMessage: resp.responseMessage,
                    data: null
                });
            } else {
                res.send(resp);
            }
        } else {
            res.send({
                responseCode: respCode.EMPTY_RESPONSE,
                responseMessage: 'login failed : username and password is required.',
                data: null
            });
        }
    } catch (error) {
        res.send({
            responseCode: respCode.EXCEPTION_OCCURED,
            responseMessage: `Exception Occured : while fetching user : ${error}`,
            data: null
        });
    }
});

router.get('/getallusers', async (req: Request, res: Response) => {
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
            const resp = await get_all_users();

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

export default { router };
