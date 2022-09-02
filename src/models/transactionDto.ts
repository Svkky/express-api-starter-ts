export interface PostTransaction {
    email: string;
    amount: string;
    recipient: string;
    walletbalance: number;
}

export interface PostTransactionResp {
    status: boolean;
    message: string;
    data: PostTransactionRespData;
}
export interface PostTransactionRespData {
    authorization_url: string;
    access_code: string;
    reference: string;
}

export interface PersistTransaction {
    username: string;
    amount: string;
    authorization_url: string;
    access_code: string;
    reference: string;
    tid: string;
    recipient: string;
}

export interface ApiResponse {
    transactionId: string;
    responseCode: string;
    responseMessage: string;
    data: any;
}
