export type DeploymentEnvironment = 
  | "commercial-cloud" 
  | "government-cloud" 
  | "air-gapped" 
  | "hybrid" 
  | "on-premise";

export type ComplianceFramework = 
  | "fedramp-moderate" 
  | "fedramp-high" 
  | "state-ramp" 
  | "nist-800-53" 
  | "nist-800-171" 
  | "cmmc" 
  | "fips-140-2" 
  | "section-508" 
  | "wcag-2.1-aa" 
  | "gdpr" 
  | "ccpa" 
  | "hipaa" 
  | "sox" 
  | "iso-27001";

export interface DeploymentConfig {
  environment: DeploymentEnvironment;
  complianceFrameworks: ComplianceFramework[];
  dataResidency: {
    requiredRegion: string;
    allowedRegions: string[];
    prohibitCrossBorderTransfer: boolean;
  };
  encryption: {
    atRest: "AES-256" | "FIPS-140-2";
    inTransit: "TLS-1.3" | "FIPS-140-2";
    keyManagement: "customer-managed" | "provider-managed" | "hsm";
  };
  authentication: {
    ssoRequired: boolean;
    mfaRequired: boolean;
    allowedProviders: ("saml" | "oidc" | "ldap" | "kerberos" | "smart-card")[];
    sessionTimeoutMinutes: number;
    concurrentSessions: number;
  };
  auditLogging: {
    enabled: boolean;
    logLevel: "minimal" | "standard" | "verbose" | "forensic";
    retentionDays: number;
    exportFormat: "cef" | "leef" | "json" | "syslog";
    tamperProof: boolean;
  };
  network: {
    allowedIPRanges: string[];
    blockTor: boolean;
    blockVPN: boolean;
    requirePrivateLink: boolean;
    dnsFiltering: boolean;
  };
  backup: {
    enabled: boolean;
    frequency: "continuous" | "hourly" | "daily" | "weekly";
    retentionDays: number;
    geoRedundant: boolean;
    encrypted: boolean;
  };
  disasterRecovery: {
    rtoHours: number;
    rpoHours: number;
    testedQuarterly: boolean;
  };
}

export const governmentDeploymentDefaults: DeploymentConfig = {
  environment: "government-cloud",
  complianceFrameworks: [
    "fedramp-moderate",
    "nist-800-53",
    "fips-140-2",
    "section-508",
    "wcag-2.1-aa",
  ],
  dataResidency: {
    requiredRegion: "us-gov-east",
    allowedRegions: ["us-gov-east", "us-gov-west", "us-gov-phoenix"],
    prohibitCrossBorderTransfer: true,
  },
  encryption: {
    atRest: "FIPS-140-2",
    inTransit: "FIPS-140-2",
    keyManagement: "hsm",
  },
  authentication: {
    ssoRequired: true,
    mfaRequired: true,
    allowedProviders: ["saml", "oidc", "smart-card"],
    sessionTimeoutMinutes: 30,
    concurrentSessions: 1,
  },
  auditLogging: {
    enabled: true,
    logLevel: "forensic",
    retentionDays: 2555,
    exportFormat: "cef",
    tamperProof: true,
  },
  network: {
    allowedIPRanges: [],
    blockTor: true,
    blockVPN: true,
    requirePrivateLink: true,
    dnsFiltering: true,
  },
  backup: {
    enabled: true,
    frequency: "continuous",
    retentionDays: 2555,
    geoRedundant: true,
    encrypted: true,
  },
  disasterRecovery: {
    rtoHours: 4,
    rpoHours: 1,
    testedQuarterly: true,
  },
};

export const corporateDeploymentDefaults: DeploymentConfig = {
  environment: "commercial-cloud",
  complianceFrameworks: [
    "soc-2-type-2",
    "iso-27001",
    "gdpr",
    "ccpa",
    "wcag-2.1-aa",
  ],
  dataResidency: {
    requiredRegion: "us-east-1",
    allowedRegions: ["us-east-1", "us-west-2", "eu-west-1", "eu-central-1", "ap-southeast-1"],
    prohibitCrossBorderTransfer: false,
  },
  encryption: {
    atRest: "AES-256",
    inTransit: "TLS-1.3",
    keyManagement: "provider-managed",
  },
  authentication: {
    ssoRequired: false,
    mfaRequired: true,
    allowedProviders: ["saml", "oidc", "ldap"],
    sessionTimeoutMinutes: 480,
    concurrentSessions: 5,
  },
  auditLogging: {
    enabled: true,
    logLevel: "standard",
    retentionDays: 365,
    exportFormat: "json",
    tamperProof: false,
  },
  network: {
    allowedIPRanges: [],
    blockTor: false,
    blockVPN: false,
    requirePrivateLink: false,
    dnsFiltering: false,
  },
  backup: {
    enabled: true,
    frequency: "daily",
    retentionDays: 365,
    geoRedundant: true,
    encrypted: true,
  },
  disasterRecovery: {
    rtoHours: 24,
    rpoHours: 4,
    testedQuarterly: false,
  },
};

export function getDeploymentConfig(
  environment: DeploymentEnvironment,
  overrides?: Partial<DeploymentConfig>
): DeploymentConfig {
  const baseConfig = 
    environment === "government-cloud" || environment === "air-gapped" || environment === "on-premise"
      ? governmentDeploymentDefaults
      : corporateDeploymentDefaults;
  
  return { ...baseConfig, ...overrides, environment };
}

export function validateCompliance(config: DeploymentConfig): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (config.complianceFrameworks.includes("fedramp-moderate") || config.complianceFrameworks.includes("fedramp-high")) {
    if (config.encryption.atRest !== "FIPS-140-2") {
      issues.push("FedRAMP requires FIPS 140-2 encryption at rest");
    }
    if (config.encryption.inTransit !== "FIPS-140-2") {
      issues.push("FedRAMP requires FIPS 140-2 encryption in transit");
    }
    if (!config.authentication.ssoRequired) {
      issues.push("FedRAMP requires SSO integration");
    }
    if (!config.authentication.mfaRequired) {
      issues.push("FedRAMP requires MFA");
    }
    if (config.auditLogging.logLevel !== "forensic") {
      issues.push("FedRAMP recommends forensic-level audit logging");
    }
  }
  
  if (config.complianceFrameworks.includes("section-508")) {
    if (!config.complianceFrameworks.includes("wcag-2.1-aa")) {
      issues.push("Section 508 requires WCAG 2.1 AA compliance");
    }
  }
  
  if (config.environment === "air-gapped") {
    if (config.network.allowedIPRanges.length === 0) {
      issues.push("Air-gapped deployments must define allowed IP ranges");
    }
  }
  
  return { valid: issues.length === 0, issues };
}