# API Documentation

## Overview
This document provides an overview of the APIs available in the project, including their purpose, request, and response templates.

## API Endpoints

### 1. User Login
**Purpose:** To authenticate a user and provide a token for session management.

**Endpoint:** `/login`

**Method:** `POST`

**Request:**
```json
{
    "username": "string",
    "password": "string"
}
```

**Response:**
```json
{
    "success": true,
    "token": "string"
}
```

### 2. Get All Data Plans
**Purpose:** To retrieve all the data plans information.

**Endpoint:** `/plans`

**Method:** `GET`

**Request Headers:**
```json
{
    "Authorization": "Bearer <token>"
}
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": "plan_3",
            "provider": "Singtel",
            "name": "1GB free every day",
            "dataFreeInGb": 1,
            "billingCycleInDays": 1,
            "price": 1,
            "excessChargePerMb": 0.015
        },
        {
            "id": "plan_2",
            "provider": "Starhub",
            "name": "50GB free every month",
            "dataFreeInGb": 50,
            "billingCycleInDays": 30,
            "price": 50,
            "excessChargePerMb": 0.01
        },
    ]
}
```

### 3. Get Data Plan with Provider Name
**Purpose:** To retrieve the data plans information of specific provider name.

**Endpoint:** `/plans?provider=M1`

**Method:** `GET`

**Request Headers:**
```json
{
    "Authorization": "Bearer <token>"
}
```

**Response:**
```json
{
    "success": true,
    "data": [
       {
            "id": "plan_5",
            "provider": "M1",
            "name": "7GB free every week",
            "dataFreeInGb": 7,
            "billingCycleInDays": 7,
            "price": 10,
            "excessChargePerMb": 0.012
        }
    ]
}
```

### 4. Get Data Plan with Provider ID
**Purpose:** To retrieve the data plans information of specific provider ID.

**Endpoint:** `/plans?id=plan_5`

**Method:** `GET`

**Request Headers:**
```json
{
    "Authorization": "Bearer <token>"
}
```

**Response:**
```json
{
    "success": true,
    "data": [
       {
            "id": "plan_5",
            "provider": "M1",
            "name": "7GB free every week",
            "dataFreeInGb": 7,
            "billingCycleInDays": 7,
            "price": 10,
            "excessChargePerMb": 0.012
        }
    ]
}
```

### 5. Import CSV into Database
**Purpose:** To import daily data usage CSV by upload and store it into database

**Endpoint:** `/import`

**Method:** `GET`

**Request Headers:**
```json
{
    "Authorization": "Bearer <token>",
    "Content-Type": "multipart/form-data"
}
```

**Request Body:**
```text
{
    file: "usage.csv"
}
```

**Expected CSV format**: 
```csv
phone_number,plan_id,date,usage_in_mb
```
**Example CSV content**:
```csv
phone_number,plan_id,date,usage_in_mb
12345678,plan_5,1735948800000,1024
11112222,plan_3,1735948800000,2048
```

**Response:**

All valid rows
```json
{
    "success": true,
    "data": {
        "imported": 600,
        "errorsLength": 0,
        "errors": []
    }
}
```

All invalid rows (i.e. contains duplicated (subscriberId, date) entries)
```json
{
    "success": true,
    "data": {
        "imported": 0,
        "errorsLength": 600,
        "errors": [
            {
                "phoneNumber": "12345678",
                "planId": "plan_1",
                "date": "2025-01-04T00:00:00.000Z",
                "usageInMb": "100",
                "reason": "There is a unique constraint violation. Existing subscriberId and date already exist."
            },
            // ...
        ]
    }
}
```

### 6. Get All Daily Data Usage 
**Purpose:** To retrieve all daily data usages of all subscribers in time decreasing order

**Endpoint:** `/usage`

**Method:** `GET`

**Request Headers:**
```json
{
    "Authorization": "Bearer <token>"
}
```

**Response:**

```json
{
    "success": true,
    "data": [
        {
            "id": "1",
            "subscriberId": "1",
            "date": "2025-01-04T00:00:00.000Z",
            "usageInMb": 986
        },
        {
            "id": "2",
            "subscriberId": "1",
            "date": "2025-01-03T00:00:00.000Z",
            "usageInMb": 1904
        },
        // ...
    ]
}
```

### 7. Get All Daily Data Usage of Specific Subscriber ID
**Purpose:** To retrieve all daily data usages of specific subscriber ID in date decreasing order

**Endpoint:** `/usage?subscriberId=1`

**Method:** `GET`

**Request Headers:**
```json
{
    "Authorization": "Bearer <token>"
}
```

**Response:**

```json
{
    "success": true,
    "data": [
        {
            "id": "1",
            "subscriberId": "1",
            "date": "2025-01-04T00:00:00.000Z",
            "usageInMb": 986
        },
        {
            "id": "2",
            "subscriberId": "1",
            "date": "2025-01-03T00:00:00.000Z",
            "usageInMb": 1904
        },
        // ...
        ]
}
```

### 8. Get All Daily Data Usage of Specific Subscriber Phone Number
**Purpose:** To retrieve all daily data usages of specific subscriber phone number in date decreasing order

**Endpoint:** `/usage?phoneNumber=12345678`

**Method:** `GET`

**Request Headers:**
```json
{
    "Authorization": "Bearer <token>"
}
```

**Response:**

Registered phone number
```json
{
    "success": true,
    "data": [
        {
            "id": "720",
            "subscriberId": "2",
            "date": "2024-11-06T00:00:00.000Z",
            "usageInMb": 1317,
            "phoneNumber": "12345678",
            "planId": "plan_2"
        },
        {
            "id": "719",
            "subscriberId": "2",
            "date": "2024-11-07T00:00:00.000Z",
            "usageInMb": 1546,
            "phoneNumber": "12345678",
            "planId": "plan_2"
        },

            // ...
    ]
}
```

Non-registered phone number
```json
{
    "success": false,
    "data": {
        "phoneNumber": "11112222"
    },
    "error": "No usage data found for the provided phone number."
}
```

### 9. Get All Daily Data Usage of Specific Subscriber Phone Number with Date Range
**Purpose:** To retrieve all daily data usages of specific subscriber phone number in the range of start & end date & in date decreasing order

**Endpoint:** `/usage?phoneNumber=12345678&startDate=2025-01-01&endDate=2025-01-03`

**Method:** `GET`

**Request Headers:**
```json
{
    "Authorization": "Bearer <token>"
}
```

**Response:**

Registered phone number
```json
{
    "success": true,
    "data": [
        {
            "id": "663",
            "subscriberId": "2",
            "date": "2025-01-02T00:00:00.000Z",
            "usageInMb": 919,
            "phoneNumber": "12345678",
            "planId": "plan_2"
        },
        {
            "id": "664",
            "subscriberId": "2",
            "date": "2025-01-01T00:00:00.000Z",
            "usageInMb": 891,
            "phoneNumber": "12345678",
            "planId": "plan_2"
        }
    ]
}
```

Non-registered phone number
```json
{
    "success": false,
    "data": {
        "phoneNumber": "11112222"
    },
    "error": "No usage data found for the provided phone number."
}
```



### 10. Get Billing Report of Specific Subscriber Over the Last N Days
**Purpose:** To retrieve billing report that includes the total cost of **all full billing cycles** incurred within that billing period for the specific subscriber over the last N days (default to 30 days if not provieded)

- Given that the current date is always the last day of the current billing cycle
- If the days parameter exceed the total count of daily usage records available for that user, it will take the total of daily records available for that user instead.

**Endpoint:** `/billing?phoneNumber=89898989&days=30`

**Method:** `GET`

**Request Headers:**
```json
{
    "Authorization": "Bearer <token>"
}
```

**Response:**

Registered phone number
```json
{
    "success": true,
    "data": {
        "phoneNumber": "89898989",
        "fullBillingCycles": 30,
        "planInfo": {
            "id": "plan_3",
            "provider": "Singtel",
            "name": "1GB free every day",
            "dataFreeInGb": 1,
            "billingCycleInDays": 1,
            "price": 1,
            "excessChargePerMb": 0.015
        },
        "billingStartDate": "12/8/2024",
        "billingEndDate": "1/7/2025",
        "totalCost": 142.81,
        "billingDetails": [
            {
                "cycleStartDate": "12/8/2024",
                "cycleEndDate": "12/9/2024",
                "cycleUsageInMb": 901,
                "excessDataInMb": 0,
                "costOfExcessData": 0,
                "costOfBillingCycle": 1
            },
            {
                "cycleStartDate": "12/9/2024",
                "cycleEndDate": "12/10/2024",
                "cycleUsageInMb": 1107,
                "excessDataInMb": 83,
                "costOfExcessData": 1.24,
                "costOfBillingCycle": 2.24
            },
            // ...
        ]
    }
}
```

Non-registered phone number
```json
{
    "success": false,
    "data": {
        "phoneNumber": "11112222"
    },
    "error": "No usage data found for the provided phone number."
}
```

### 11. Get All Subscribers 
**Purpose:** To retrieve all subscribers information

**Endpoint:** `/subscribers`

**Method:** `GET`

**Request Headers:**
```json
{
    "Authorization": "Bearer <token>"
}
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "phoneNumber": "12345678",
            "planId": "plan_3"
        },
        {
            "id": 2,
            "phoneNumber": "81234567",
            "planId": "plan_2"
        },
        // ...
    ]
}
```

### 12. Get All Subscribers With ID
**Purpose:** To retrieve all subscribers information by ID

**Endpoint:** `/subscribers?id=1`

**Method:** `GET`

**Request Headers:**
```json
{
    "Authorization": "Bearer <token>"
}
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "phoneNumber": "12345678",
            "planId": "plan_3"
        }
    ]
}
```

### 13. Get All Subscribers With Phone Number
**Purpose:** To retrieve all subscribers information by phone number

**Endpoint:** `/subscribers?phoneNumber=12345678`

**Method:** `GET`

**Request Headers:**
```json
{
    "Authorization": "Bearer <token>"
}
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "phoneNumber": "12345678",
            "planId": "plan_3"
        }
    ]
}
```














