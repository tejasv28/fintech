package com.finshield.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class OfficerPerformanceResponse {
    private UUID officerId;
    private String officerName;
    private long totalApplicationsProcessed;
    private long approvedApplications;
    private long rejectedApplications;
    private double approvalRate;
}
