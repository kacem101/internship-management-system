package com.enscs.internship.dto.request;

import lombok.Data;

@Data
public class WithdrawRequest {
    /** Optional for PENDING, required for UNDER_REVIEW (min 20 chars enforced in service) */
    private String withdrawalReason;
}
