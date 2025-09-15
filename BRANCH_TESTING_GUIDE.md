# Branch Management System Testing Guide

## Overview
This guide provides comprehensive testing instructions for the enhanced branch management system, including both create and edit branch functionalities.

## Prerequisites
1. Start the development server: `npm run dev`
2. Ensure you have a valid authentication token
3. Access the application at `http://localhost:3000`

## Test Scenarios

### 1. Create Branch Page Testing

#### Navigation Test
- Navigate to `/dashboard/create-branch`
- Verify the page loads with all form sections visible
- Check that the header shows "Create Branch"

#### UI Components Test
Verify all sections are present and properly styled:
- ✅ Branch & Address Information (Top Left Card)
- ✅ Operational Details (Top Right Card)  
- ✅ Course & Staff Assignments (Bottom Left Card)
- ✅ Bank Details (Bottom Right Card)

#### Form Validation Test
1. **Required Fields Validation**
   - Try submitting empty form
   - Verify error messages appear for required fields:
     - Branch Name
     - Branch Code
     - Email
     - Phone
     - Address Line 1
     - Area
     - City
     - State
     - Pincode
     - At least one course offering

2. **Email Validation**
   - Enter invalid email format
   - Verify proper error message

#### Functional Components Test
1. **Manager Selection Dropdown**
   - Click manager dropdown
   - Verify options: Ravi Kumar, Priya Sharma, Amit Singh, Sunita Patel
   - Select a manager

2. **Courses Offered Multi-Select**
   - Check/uncheck course checkboxes
   - Verify badges appear for selected courses
   - Test removing courses via badge X button
   - Available courses: Taekwondo Basics, Advanced Karate, Kung Fu Fundamentals, Self Defense for Women, Mixed Martial Arts, Kids Martial Arts

3. **Operating Hours Management**
   - Add timing for different days
   - Verify day dropdown shows all weekdays
   - Test time input fields
   - Verify "Update" vs "Add" button logic
   - Test removing timings

4. **Holiday Management**
   - Add holiday dates using date picker
   - Verify holidays appear as badges
   - Test removing holidays via X button
   - Test Enter key functionality

5. **Course Assignments**
   - Select courses to assign to branch
   - Verify badges display selected courses
   - Test removing assignments

6. **Branch Admin Assignment**
   - Select coaches as branch admins
   - Available coaches: Master John Lee, Coach Sarah Kim, Sensei David Wong, Coach Maria Garcia
   - Verify badges display selected admins

7. **Bank Details**
   - Test bank dropdown selection
   - Available banks: State Bank of India, HDFC Bank, ICICI Bank, Axis Bank, Punjab National Bank, Bank of Baroda, Canara Bank, Union Bank of India
   - Enter account number and UPI ID
   - Verify help text displays

#### Form Submission Test
1. Fill all required fields
2. Submit form
3. Verify loading state with spinner
4. Verify success popup appears
5. Verify redirect to branches list

### 2. Edit Branch Page Testing

#### Navigation Test
- Navigate to `/dashboard/branches/edit/branch-uuid-1`
- Verify the page loads with pre-populated data
- Check that the header shows "Edit Branch"

#### Data Population Test
Verify form is pre-populated with existing data:
- Branch information fields
- Manager selection
- Courses offered checkboxes
- Operating hours
- Holidays
- Course assignments
- Branch admin assignments
- Bank details

#### UI Consistency Test
Compare edit page with create page:
- ✅ Same card layout (2x2 grid)
- ✅ Same form sections and styling
- ✅ Same dropdown components
- ✅ Same multi-select functionality
- ✅ Same badge displays
- ✅ Same validation logic

#### Functional Updates Test
1. **Update Branch Information**
   - Modify branch name, code, email, phone
   - Update address fields
   - Change manager selection

2. **Update Operational Details**
   - Add/remove courses offered
   - Modify operating hours
   - Add/remove holidays

3. **Update Assignments**
   - Change course assignments
   - Modify branch admin assignments
   - Toggle accessories availability

4. **Update Bank Details**
   - Change bank selection
   - Update account number and UPI ID

#### Form Submission Test
1. Make changes to various fields
2. Submit form
3. Verify loading state shows "Updating Branch..."
4. Verify success popup shows "Branch Updated Successfully!"
5. Verify redirect to branches list

### 3. API Endpoints Testing

#### GET /api/branches/{id}
```bash
curl -X GET "http://localhost:3000/api/branches/branch-uuid-1" \
  -H "Authorization: Bearer your-token-here"
```

Expected Response:
- Status: 200
- Complete branch data with nested structure
- All operational details, assignments, and bank details

#### PUT /api/branches/{id}
```bash
curl -X PUT "http://localhost:3000/api/branches/branch-uuid-1" \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "branch": {
      "name": "Updated Branch Name"
    }
  }'
```

Expected Response:
- Status: 200
- Success message
- Updated branch data

#### Error Handling Test
1. **401 Unauthorized**
   - Test without Authorization header
   - Test with invalid token

2. **404 Not Found**
   - Test with non-existent branch ID

3. **400 Bad Request**
   - Test with invalid JSON payload

### 4. Integration Testing

#### End-to-End Workflow
1. Create a new branch with complete data
2. Navigate to branches list
3. Edit the created branch
4. Verify changes are saved
5. Test navigation between pages

#### Data Consistency Test
1. Create branch with specific data
2. Edit the branch
3. Verify all original data is preserved
4. Verify only modified fields are updated

### 5. Browser Compatibility Testing

Test in multiple browsers:
- Chrome
- Firefox
- Safari
- Edge

Verify:
- Form rendering
- Dropdown functionality
- Date picker functionality
- Responsive design

### 6. Performance Testing

1. **Load Time**
   - Measure page load time
   - Verify API response times

2. **Form Interaction**
   - Test responsiveness of form interactions
   - Verify smooth animations and transitions

## Expected Results

### Create Branch Page
- All form sections render correctly
- Validation works as expected
- Multi-select components function properly
- Form submission creates branch successfully

### Edit Branch Page
- Form pre-populates with existing data
- All update operations work correctly
- UI matches create page exactly
- Form submission updates branch successfully

### API Endpoints
- All endpoints respond correctly
- Error handling works as expected
- Data structure matches frontend expectations

## Troubleshooting

### Common Issues
1. **Form not submitting**: Check validation errors
2. **Data not loading**: Verify API endpoint and authentication
3. **Styling issues**: Check Tailwind CSS classes
4. **Dropdown not working**: Verify component imports

### Debug Steps
1. Check browser console for errors
2. Verify network requests in DevTools
3. Check API response structure
4. Validate form data before submission

## Success Criteria

✅ Create branch page works completely
✅ Edit branch page matches create page UI exactly
✅ All form components function properly
✅ API endpoints handle requests correctly
✅ Error handling works as expected
✅ Data validation is consistent
✅ User experience is seamless
