import { stripHexPrefix } from "@interlay/polkabtc";
import { Dispatch } from "redux";
import { IssueRequest } from "../types/issue.types";
import { RedeemRequest } from "../types/redeem.types";
import { RedeemActions, IssueActions } from "../types/actions.types";
import { updateIssueRequestAction, addTransactionListenerIssue } from "../actions/issue.actions";
import { updateRedeemRequestAction, addTransactionListenerRedeem } from "../actions/redeem.actions";

export async function startTransactionWatcherIssue(
    request: IssueRequest,
    dispatch: Dispatch<IssueActions>
): Promise<void> {
    dispatch(addTransactionListenerIssue(request.id));
    updateTransactionStatusIssue(request, dispatch).then(() => {
        setInterval(() => updateTransactionStatusIssue(request, dispatch), 10_000);
    });
}

export async function updateTransactionStatusIssue(
    request: IssueRequest,
    dispatch: Dispatch<IssueActions>
): Promise<void> {
    if (request && request.btcTxId && window.polkaBTC) {
        try {
            const updatedRequest = request;
            updatedRequest.btcTxId = await window.polkaBTC.btcCore.getTxIdByOpReturn(
                request.id,
                request.vaultBTCAddress,
                request.amountBTC
            );
            const txStatus = await window.polkaBTC.btcCore.getTransactionStatus(stripHexPrefix(request.btcTxId));
            if (request.confirmations !== txStatus.confirmations) {
                updatedRequest.confirmations = txStatus.confirmations;
                dispatch(updateIssueRequestAction(updatedRequest));
            }
        } catch (error) {
            console.log(error.toString());
        }
    }
}

export async function startTransactionWatcherRedeem(
    request: RedeemRequest,
    dispatch: Dispatch<RedeemActions>
): Promise<void> {
    dispatch(addTransactionListenerRedeem(request.id));
    updateTransactionStatusRedeem(request, dispatch).then(() => {
        setInterval(() => updateTransactionStatusRedeem(request, dispatch), 10_000);
    });
}

export async function updateTransactionStatusRedeem(
    request: RedeemRequest,
    dispatch: Dispatch<RedeemActions>
): Promise<void> {
    if (request && request.btcTxId && window.polkaBTC) {
        try {
            const updatedRequest = request;
            updatedRequest.btcTxId = await window.polkaBTC.btcCore.getTxIdByOpReturn(
                request.id,
                request.btcAddress,
                request.amountPolkaBTC
            );
            const txStatus = await window.polkaBTC.btcCore.getTransactionStatus(stripHexPrefix(updatedRequest.btcTxId));
            if (request.confirmations !== txStatus.confirmations) {
                updatedRequest.confirmations = txStatus.confirmations;
                dispatch(updateRedeemRequestAction(updatedRequest));
            }
        } catch (error) {
            console.log(error.toString());
        }
    }
}
