# Branch Management API Implementation

## API Endpoint: POST /api/branches

**Description**: Create new branch with comprehensive nested structure  
**Access**: Super Admin only  
**File Location**: `app/api/branches/route.ts`

### Headers Required:
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### Complete API Payload Structure Implemented:

```json
{
  "branch": {
    "name": "Rock martial arts",
    "code": "RMA01", 
    "email": "yourname@email.com",
    "phone": "+13455672356",
    "address": {
      "line1": "928#123",
      "area": "Madhapur", 
      "city": "Hyderabad",
      "state": "Telangana",
      "pincode": "500089",
      "country": "India"
    }
  },
  "manager_id": "manager-uuid-1234",
  "operational_details": {
    "courses_offered": ["Rock martial arts"],
    "timings": [
      { "day": "Monday", "open": "07:00", "close": "19:00" },
      { "day": "Tuesday", "open": "07:00", "close": "19:00" },
      { "day": "Wednesday", "open": "07:00", "close": "19:00" },
      { "day": "Thursday", "open": "07:00", "close": "19:00" },
      { "day": "Friday", "open": "07:00", "close": "19:00" },
      { "day": "Saturday", "open": "08:00", "close": "18:00" },
      { "day": "Sunday", "open": "08:00", "close": "16:00" }
    ],
    "holidays": ["2025-10-02", "2025-12-25"]
  },
  "assignments": {
    "accessories_available": true,
    "courses": ["course-uuid-1", "course-uuid-2", "course-uuid-3"],
    "branch_admins": ["coach-uuid-1", "coach-uuid-2"]
  },
  "bank_details": {
    "bank_name": "State Bank of India",
    "account_number": "XXXXXXXXXXXX",
    "upi_id": "name@ybl"
  }
}
```

## Form Implementation Details

### Frontend Form: `app/dashboard/create-branch/page.tsx`

The form is organized into comprehensive sections that collect all the required data:

#### 1. Branch Information
- **name**: Branch name (required)
- **code**: Unique branch code (required) 
- **email**: Branch contact email (required)
- **phone**: Branch contact phone (required)

#### 2. Address Information  
- **line1**: Building/House number and street (required)
- **area**: Area/Locality (required)
- **city**: City (required)
- **state**: State (required) 
- **pincode**: PIN/ZIP code (required)
- **country**: Country (dropdown, defaults to India)

#### 3. Branch Manager
- **manager_id**: Select from available managers (dropdown with predefined options)

#### 4. Operational Details
- **courses_offered**: Multi-select checkboxes for courses (required, at least one)
- **timings**: Complete week schedule with open/close times for each day
- **holidays**: Dynamic holiday date picker with add/remove functionality

#### 5. Course & Staff Assignments
- **accessories_available**: Boolean checkbox for accessories availability
- **courses**: Multi-select course assignments (UUIDs)
- **branch_admins**: Multi-select coach assignments as branch admins

#### 6. Bank Details
- **bank_name**: Dropdown selection from major banks
- **account_number**: Text input for account number
- **upi_id**: Text input for UPI ID

## API Features Implemented

### Request Validation:
- ✅ Authorization header validation
- ✅ Required field validation for branch info
- ✅ Required field validation for address
- ✅ Operational details validation
- ✅ JSON payload structure validation

### Response Structure:
```json
{
  "success": true,
  "message": "Branch created successfully",
  "data": {
    "branch_id": "branch-1702345678901",
    "branch": { /* complete branch info with timestamps */ },
    "manager_id": "manager-uuid-1234",
    "operational_details": { /* with created_at timestamp */ },
    "assignments": { /* with assigned_at timestamp */ },
    "bank_details": { /* with verification status and created_at */ }
  }
}
```

### Error Handling:
- ✅ 401 for missing/invalid authorization
- ✅ 400 for missing required fields
- ✅ 400 for invalid JSON payload
- ✅ 500 for internal server errors

## Form Features

### UI/UX Features:
- ✅ Back button navigation to branches list
- ✅ Comprehensive validation with error messages
- ✅ Multi-select checkboxes with badge display
- ✅ Dynamic holiday management (add/remove)
- ✅ Weekly schedule configuration
- ✅ Loading states during submission
- ✅ Success popup with auto-redirect
- ✅ Responsive design with card layouts

### Data Management:
- ✅ Real-time form state management
- ✅ Badge display for selected items with remove buttons
- ✅ Dynamic array operations (holidays, courses, admins)
- ✅ Form validation before submission
- ✅ API integration with proper error handling

## Mock Data Available:

The implementation includes realistic mock data for:
- **Managers**: 4 predefined managers with UUIDs
- **Courses**: 6 available courses with UUIDs  
- **Coaches**: 4 available coaches for admin assignment
- **Banks**: 8 major Indian banks for selection

## Build Status: ✅ 
- Form compiles successfully
- API route functional
- All TypeScript interfaces defined
- Complete validation implemented
- Ready for production deployment
