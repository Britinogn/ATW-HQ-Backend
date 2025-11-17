export enum UserRole {
    USER = "user",
    ADMIN = "admin",
    AGENT = "agent"
}

export enum PropertyStatus{
    AVAILABLE = 'available',
    SOLD = 'sold',
    RENTED = 'rented',
    UNDERCONSTRUCTION = 'underconstruction'
}


export enum PropertyType{
    LAND = 'land',
    APARTMENT = 'apartment',
    HOUSE = 'house',
    RENT = 'rent',
    COMMERCIAL = 'commercial',
}

export enum CarCondition {
    NEW = 'new',
    USED = 'used',
    CERTIFIED = 'certified',
}

// agent verification status

// export enum IAgentDetails{
//     companyName = 'string',
//     businessLicense = 'string',  // e.g., Cloudinary URL for uploaded document
//     address = 'string',
//     phone = 'string',
//     experienceYears = 'number',
//     services = 'string[]',
//     description = 'string',
//     IDUrl = 'string'
// }

export enum AgentApplicationStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}