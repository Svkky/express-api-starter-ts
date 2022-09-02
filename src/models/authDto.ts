export class Guid {
    static newGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0,
                v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
}

export interface LoginResponse {
    responseCode: string;
    responseMessage: string;
    jwttoken: string;
    expires: number;
    issued: number;
    data: any;
}

export interface BaseResponse {
    responseCode: string;
    responseMessage: string;
    data: any;
}

export interface Login {
    username: string;
    password: string;
}

export interface Session {
    request: string;
    /**
     * Timestamp indicating when the session was created, in Unix milliseconds.
     */
    issued: number;
    /**
     * Timestamp indicating when the session should expire, in Unix milliseconds.
     */
    expires: number;
}

/**
 * Identical to the Session type, but without the `issued` and `expires` properties.
 */
export type PartialSession = Omit<Session, 'issued' | 'expires'>;

export interface EncodeRequest {
    username: string;
    walletnumber: string;
    walletbalance: number;
}

export interface EncodeResult {
    responseCode: string;
    responseMessage: string;
    data: any;
}

export interface EncodeResultData {
    jwttoken: string;
    expires: number;
    issued: number;
}

export interface DecodeResult {
    type: string;
    username: string;
    walletnumber: string;
    walletbalance: number;
}

export type DecodeResult1 =
    | {
          type: 'valid';
          username: string;
          password: string;
          walletnumber: string;
          walletbalance: number;
      }
    | {
          type: 'integrity-error';
      }
    | {
          type: 'invalid-token';
      };

export type ExpirationStatus = 'expired' | 'active' | 'grace';
