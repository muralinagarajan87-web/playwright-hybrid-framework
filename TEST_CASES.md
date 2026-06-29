# Test Cases — Manual Test Documentation

> Source of truth for both manual execution and automation.
> Tags: `@sanity` = runs on every PR | `@regression` = runs on merge + nightly schedule

---

## Test Users Reference — SauceDemo

| Username | Password | Behaviour |
|---|---|---|
| standard_user | secret_sauce | Full access — golden path user |
| locked_out_user | secret_sauce | Blocked from logging in |
| problem_user | secret_sauce | UI defects (broken buttons/images) |
| performance_glitch_user | secret_sauce | Slow page load |

---

## Part 1: Web UI — SauceDemo (https://www.saucedemo.com)

---

### Module 1: Login

---

#### TC_LOGIN_001 — Verify successful login with valid credentials

**Priority:** Critical | **Tags:** `@sanity` `@regression`

**Preconditions:**
- The Swag Labs application is accessible
- No active user session exists in the browser

**Test Data:**

| Field | Value |
|---|---|
| Username | standard_user |
| Password | secret_sauce |

**Test Steps:**
1. Open the Swag Labs application in the browser
2. Enter "standard_user" in the Username field
3. Enter "secret_sauce" in the Password field
4. Click the Login button
5. Verify that the Products page is displayed

**Expected Result:**
The user is successfully logged in and redirected to the Products inventory page. The page heading "Products" is visible and no error message is shown.

---

#### TC_LOGIN_002 — Verify login fails with an invalid password

**Priority:** Critical | **Tags:** `@sanity` `@regression`

**Preconditions:**
- The Swag Labs application is accessible
- No active user session exists

**Test Data:**

| Field | Value |
|---|---|
| Username | standard_user |
| Password | wrong_password |

**Test Steps:**
1. Open the Swag Labs application in the browser
2. Enter "standard_user" in the Username field
3. Enter "wrong_password" in the Password field
4. Click the Login button
5. Verify that an error message is displayed on the login page

**Expected Result:**
The user remains on the login page. The error message "Epic sadface: Username and password do not match any user in this service" is displayed. No access to the Products page is granted.

---

#### TC_LOGIN_003 — Verify a locked-out user is blocked from logging in

**Priority:** High | **Tags:** `@regression`

**Preconditions:**
- The Swag Labs application is accessible
- No active user session exists

**Test Data:**

| Field | Value |
|---|---|
| Username | locked_out_user |
| Password | secret_sauce |

**Test Steps:**
1. Open the Swag Labs application in the browser
2. Enter "locked_out_user" in the Username field
3. Enter "secret_sauce" in the Password field
4. Click the Login button
5. Verify that an error message is displayed indicating the user is locked out

**Expected Result:**
The user remains on the login page. The error message "Epic sadface: Sorry, this user has been locked out" is displayed. No access to the Products page is granted.

---

#### TC_LOGIN_004 — Verify login form validation when the Username field is empty

**Priority:** High | **Tags:** `@regression`

**Preconditions:**
- The Swag Labs application is accessible
- No active user session exists

**Test Data:**

| Field | Value |
|---|---|
| Username | (left empty) |
| Password | secret_sauce |

**Test Steps:**
1. Open the Swag Labs application in the browser
2. Leave the Username field empty
3. Enter "secret_sauce" in the Password field
4. Click the Login button
5. Verify that a validation error message is displayed

**Expected Result:**
The user remains on the login page. The error message "Epic sadface: Username is required" is displayed. The login action does not proceed.

---

#### TC_LOGIN_005 — Verify login form validation when the Password field is empty

**Priority:** High | **Tags:** `@regression`

**Preconditions:**
- The Swag Labs application is accessible
- No active user session exists

**Test Data:**

| Field | Value |
|---|---|
| Username | standard_user |
| Password | (left empty) |

**Test Steps:**
1. Open the Swag Labs application in the browser
2. Enter "standard_user" in the Username field
3. Leave the Password field empty
4. Click the Login button
5. Verify that a validation error message is displayed

**Expected Result:**
The user remains on the login page. The error message "Epic sadface: Password is required" is displayed. The login action does not proceed.

---

### Module 2: Product Catalog

---

#### TC_CAT_001 — Verify a product can be added to the cart

**Priority:** Critical | **Tags:** `@sanity` `@regression`

**Preconditions:**
- User is logged in as standard_user
- The Products page is displayed

**Test Data:**

| Field | Value |
|---|---|
| Product | Sauce Labs Backpack |

**Test Steps:**
1. On the Products page, locate the product "Sauce Labs Backpack"
2. Click the "Add to cart" button for "Sauce Labs Backpack"
3. Verify that the cart icon badge in the header displays the count "1"
4. Verify that the button for "Sauce Labs Backpack" changes its label to "Remove"

**Expected Result:**
"Sauce Labs Backpack" is successfully added to the cart. The cart badge displays "1" and the product button label changes from "Add to cart" to "Remove".

---

#### TC_CAT_002 — Verify multiple products can be added to the cart independently

**Priority:** High | **Tags:** `@regression`

**Preconditions:**
- User is logged in as standard_user
- The Products page is displayed with no items in the cart

**Test Data:**

| Field | Value |
|---|---|
| Product 1 | Sauce Labs Backpack |
| Product 2 | Sauce Labs Bike Light |
| Product 3 | Sauce Labs Bolt T-Shirt |

**Test Steps:**
1. On the Products page, click "Add to cart" for "Sauce Labs Backpack"
2. Verify that the cart badge shows "1"
3. Click "Add to cart" for "Sauce Labs Bike Light"
4. Verify that the cart badge shows "2"
5. Click "Add to cart" for "Sauce Labs Bolt T-Shirt"
6. Verify that the cart badge shows "3"

**Expected Result:**
All three products are independently added to the cart. The cart badge count increments correctly after each addition and displays "3" after all three products are added.

---

#### TC_CAT_003 — Verify the cart is empty and shows no badge when no products have been added

**Priority:** Medium | **Tags:** `@regression`

**Preconditions:**
- User is logged in as standard_user
- The Products page is displayed
- No products have been added to the cart in this session

**Test Data:**

| Field | Value |
|---|---|
| N/A | — |

**Test Steps:**
1. On the Products page, verify that no cart badge is visible on the cart icon in the header
2. Click the cart icon to navigate to the Your Cart page
3. Verify that no items are listed in the cart

**Expected Result:**
The cart icon shows no badge. The Your Cart page is empty with no products listed.

---

#### TC_CAT_004 — Verify all product details are correctly displayed on the Products page

**Priority:** Medium | **Tags:** `@regression`

**Preconditions:**
- User is logged in as standard_user
- The Products page is displayed

**Test Data:**

| Field | Value |
|---|---|
| N/A | — |

**Test Steps:**
1. On the Products page, verify that at least one product is listed
2. Verify that each product displays a product name (non-empty text)
3. Verify that each product displays a price in the format "$X.XX"
4. Verify that each product displays a product image that loads correctly
5. Verify that each product has an enabled "Add to cart" button

**Expected Result:**
Every product on the Products page displays a valid name, correctly formatted price, a loaded image, and an enabled "Add to cart" button. No broken images or missing data are present.

---

### Module 3: Shopping Cart & Checkout

---

#### TC_CHECKOUT_001 — Verify a user can successfully complete the full checkout flow

**Priority:** Critical | **Tags:** `@sanity` `@regression`

**Preconditions:**
- User is logged in as standard_user
- "Sauce Labs Backpack" has been added to the cart
- User is on the Your Cart page

**Test Data:**

| Field | Value |
|---|---|
| Product in Cart | Sauce Labs Backpack |
| First Name | John |
| Last Name | Doe |
| Postal Code | 10001 |

**Test Steps:**
1. On the Your Cart page, verify that "Sauce Labs Backpack" is listed as a cart item
2. Click the "Checkout" button
3. On the Checkout: Your Information page, enter "John" in the First Name field
4. Enter "Doe" in the Last Name field
5. Enter "10001" in the Postal Code field
6. Click the "Continue" button
7. On the Checkout: Overview page, verify that "Sauce Labs Backpack" appears in the order summary
8. Verify that a total price is displayed on the overview page
9. Click the "Finish" button
10. Verify that the order confirmation message is displayed

**Expected Result:**
The checkout completes successfully. The order confirmation page displays "Thank you for your order!" with a confirmation message. The back-to-products button is visible. No errors occur at any step.

---

#### TC_CHECKOUT_002 — Verify checkout form validation error when all fields are left empty

**Priority:** Critical | **Tags:** `@sanity` `@regression`

**Preconditions:**
- User is logged in as standard_user
- At least one product is in the cart
- User is on the Checkout: Your Information page

**Test Data:**

| Field | Value |
|---|---|
| First Name | (left empty) |
| Last Name | (left empty) |
| Postal Code | (left empty) |

**Test Steps:**
1. On the Checkout: Your Information page, leave the First Name field empty
2. Leave the Last Name field empty
3. Leave the Postal Code field empty
4. Click the "Continue" button
5. Verify that an error message is displayed on the page

**Expected Result:**
The user remains on the Checkout: Your Information page. The error message "Error: First Name is required" is displayed. No navigation to the next checkout step occurs.

---

#### TC_CHECKOUT_003 — Verify checkout form validation error when Postal Code is missing

**Priority:** High | **Tags:** `@regression`

**Preconditions:**
- User is logged in as standard_user
- At least one product is in the cart
- User is on the Checkout: Your Information page

**Test Data:**

| Field | Value |
|---|---|
| First Name | Jane |
| Last Name | Smith |
| Postal Code | (left empty) |

**Test Steps:**
1. On the Checkout: Your Information page, enter "Jane" in the First Name field
2. Enter "Smith" in the Last Name field
3. Leave the Postal Code field empty
4. Click the "Continue" button
5. Verify that an error message is displayed on the page

**Expected Result:**
The user remains on the Checkout: Your Information page. The error message "Error: Postal Code is required" is displayed. No navigation to the order overview step occurs.

---

### E2E: Full Purchase Flow

---

#### TC_E2E_WEB_001 — Verify the complete end-to-end purchase flow from login to order confirmation

**Priority:** Critical | **Tags:** `@sanity` `@regression`

**Preconditions:**
- Swag Labs application is accessible
- No active user session exists

**Test Data:**

| Field | Value |
|---|---|
| Username | standard_user |
| Password | secret_sauce |
| Product | Sauce Labs Backpack |
| First Name | John |
| Last Name | Doe |
| Postal Code | 10001 |

**Test Steps:**
1. Open the Swag Labs application in the browser
2. Enter "standard_user" in the Username field and "secret_sauce" in the Password field
3. Click the Login button
4. Verify that the Products page is displayed
5. Click "Add to cart" for "Sauce Labs Backpack"
6. Verify that the cart badge shows "1"
7. Click the cart icon to navigate to the Your Cart page
8. Verify that "Sauce Labs Backpack" is listed in the cart
9. Click the "Checkout" button
10. Enter "John" in the First Name field, "Doe" in the Last Name field, and "10001" in the Postal Code field
11. Click the "Continue" button
12. On the Checkout: Overview page, verify that "Sauce Labs Backpack" and a total price are displayed
13. Click the "Finish" button
14. Verify that the order confirmation page displays "Thank you for your order!"

**Expected Result:**
The complete purchase flow executes without any errors. The user successfully logs in, adds a product to the cart, completes the checkout with valid information, and receives an order confirmation. All page transitions occur as expected at each step.

---

---

## Part 2: API — Restful-Booker (https://restful-booker.herokuapp.com)

### API Reference

| Endpoint | Method | Auth Required |
|---|---|---|
| /auth | POST | No |
| /booking | GET | No |
| /booking/:id | GET | No |
| /booking | POST | No |
| /booking/:id | PUT | Yes — Cookie: token |
| /booking/:id | PATCH | Yes — Cookie: token |
| /booking/:id | DELETE | Yes — Cookie: token |

> **Auth header:** `Cookie: token=<value>`
> **Content-Type (write requests):** `application/json`
> **Accept (all requests):** `application/json`

---

### API Schema Reference

#### Booking Request / Response Schema

| Field | Type | Required | Rules |
|---|---|---|---|
| firstname | string | Yes | Non-empty |
| lastname | string | Yes | Non-empty |
| totalprice | integer | Yes | >= 0 |
| depositpaid | boolean | Yes | true or false |
| bookingdates | object | Yes | Must contain checkin and checkout |
| bookingdates.checkin | string | Yes | Format: YYYY-MM-DD |
| bookingdates.checkout | string | Yes | Format: YYYY-MM-DD, must be >= checkin |
| additionalneeds | string | No | Optional free text |

#### CreateBooking Response Schema

| Field | Type | Rules |
|---|---|---|
| bookingid | integer | Unique positive integer, > 0 |
| booking | Booking object | Full booking object as above |

#### Auth Success Response Schema

| Field | Type | Rules |
|---|---|---|
| token | string | Non-empty, usable in Cookie header |

#### Auth Failure Response Schema

| Field | Type | Rules |
|---|---|---|
| reason | string | Exactly equals "Bad credentials" |

---

### Validation Layers — Applied to Every API Test Case

Every API test case in this suite covers all eight validation layers below. Each test case's **Validation Checks** table maps directly to these layers.

| Layer | Name | What It Validates |
|---|---|---|
| L1 | Request Schema | Correct fields, types, and required/optional rules are honoured before sending |
| L2 | Status Code | HTTP response code matches the expected code for the scenario |
| L3 | Response Time | API responds within the defined performance threshold |
| L4 | Response Schema | All expected fields are present in the response with correct data types |
| L5 | Contract | API honours its documented behavioural contract (field semantics and business rules) |
| L6 | Business Logic | Domain rules are enforced (auth required, date ordering, mandatory fields) |
| L7 | Data Integrity | Values sent in the request are accurately stored and returned in the response |
| L8 | Header | Response headers (Content-Type) match expected values |

---

### Module 1: Authentication — POST /auth

---

#### TC_AUTH_001 — Verify a valid auth token is returned with correct credentials

**Priority:** Critical | **Tags:** `@sanity` `@regression`

**Preconditions:**
- Restful-Booker API is accessible at https://restful-booker.herokuapp.com

**Request Specification:**

| Property | Value |
|---|---|
| Method | POST |
| Endpoint | /auth |
| Content-Type | application/json |
| Accept | application/json |
| Auth Required | No |

**Request Schema:**

| Field | Type | Required | Test Value |
|---|---|---|---|
| username | string | Yes | admin |
| password | string | Yes | password123 |

**Test Steps:**
1. Send a POST request to /auth with username "admin" and password "password123"
2. Verify that the response status code is 200
3. Verify that the response time is within the acceptable threshold
4. Verify that the response body contains a "token" field
5. Verify that the "token" value is a non-empty string
6. Verify that the response body does not contain a "reason" field
7. Verify that the response Content-Type header is application/json

**Validation Checks:**

| # | Layer | What to Check | Expected |
|---|---|---|---|
| 1 | Request Schema | Request body contains "username" (string, non-empty) | Sent correctly |
| 2 | Request Schema | Request body contains "password" (string, non-empty) | Sent correctly |
| 3 | Status Code | HTTP response status | 200 |
| 4 | Response Time | Time to receive full response | < 3000ms |
| 5 | Response Schema | "token" field is present in response body | Present |
| 6 | Response Schema | "token" data type | string |
| 7 | Contract | "token" value is non-empty (length > 0) | Non-empty |
| 8 | Contract | "reason" field is absent in a successful auth response | Absent |
| 9 | Business Logic | Token can be used as `Cookie: token=<value>` to authenticate PUT/DELETE calls | Usable |
| 10 | Data Integrity | N/A — credentials are not echoed back in response | — |
| 11 | Header | Response Content-Type includes "application/json" | application/json |

**Expected Result:**
The API returns HTTP 200 within 3000ms. The response body contains a valid, non-empty "token" string. No "reason" field is present. The Content-Type header is application/json. The token can be used to authenticate subsequent protected API calls.

---

#### TC_AUTH_002 — Verify the API rejects authentication with an invalid password

**Priority:** Critical | **Tags:** `@sanity` `@regression`

**Preconditions:**
- Restful-Booker API is accessible

**Request Specification:**

| Property | Value |
|---|---|
| Method | POST |
| Endpoint | /auth |
| Content-Type | application/json |
| Accept | application/json |
| Auth Required | No |

**Request Schema:**

| Field | Type | Required | Test Value |
|---|---|---|---|
| username | string | Yes | admin |
| password | string | Yes | wrongpassword (invalid) |

**Test Steps:**
1. Send a POST request to /auth with username "admin" and password "wrongpassword"
2. Verify that the response status code is 200
3. Verify that the response time is within the acceptable threshold
4. Verify that the response body contains a "reason" field
5. Verify that the "reason" value equals exactly "Bad credentials"
6. Verify that the response body does not contain a "token" field

**Validation Checks:**

| # | Layer | What to Check | Expected |
|---|---|---|---|
| 1 | Request Schema | Request body is structurally valid (both fields present, correct types) | Sent correctly |
| 2 | Status Code | HTTP response status | 200 |
| 3 | Response Time | Time to receive full response | < 3000ms |
| 4 | Response Schema | "reason" field is present in response body | Present |
| 5 | Response Schema | "reason" data type | string |
| 6 | Contract | "reason" value equals exactly "Bad credentials" | "Bad credentials" |
| 7 | Contract | "token" field is absent in a failed auth response | Absent |
| 8 | Business Logic | No token is issued when password does not match | No token returned |
| 9 | Business Logic | Using an invalid response as a token for protected endpoints results in 403 | 403 returned |
| 10 | Header | Response Content-Type includes "application/json" | application/json |

**Expected Result:**
The API returns HTTP 200 within 3000ms. The response body is `{ "reason": "Bad credentials" }`. No "token" field is present. The response is structurally valid but denies access.

---

#### TC_AUTH_003 — Verify the API rejects authentication when the username field is missing

**Priority:** High | **Tags:** `@regression`

**Preconditions:**
- Restful-Booker API is accessible

**Request Specification:**

| Property | Value |
|---|---|
| Method | POST |
| Endpoint | /auth |
| Content-Type | application/json |
| Auth Required | No |

**Request Schema:**

| Field | Type | Required | Test Value |
|---|---|---|---|
| username | string | Yes | (omitted — not sent) |
| password | string | Yes | password123 |

**Test Steps:**
1. Send a POST request to /auth including only the "password" field — "username" is not included in the request body
2. Verify that the response status code is 200
3. Verify that the response time is within the acceptable threshold
4. Verify that the response body contains a "reason" field with value "Bad credentials"
5. Verify that the response body does not contain a "token" field

**Validation Checks:**

| # | Layer | What to Check | Expected |
|---|---|---|---|
| 1 | Request Schema | Intentionally send incomplete schema (missing "username") | Schema violation sent |
| 2 | Status Code | HTTP response status | 200 |
| 3 | Response Time | Time to receive full response | < 3000ms |
| 4 | Response Schema | "reason" field present | Present |
| 5 | Contract | "reason" value equals "Bad credentials" | "Bad credentials" |
| 6 | Contract | "token" field is absent | Absent |
| 7 | Business Logic | API enforces presence of both username and password | Auth rejected |
| 8 | Header | Response Content-Type includes "application/json" | application/json |

**Expected Result:**
The API returns HTTP 200 with `{ "reason": "Bad credentials" }`. No token is issued when a required request field is missing. The API handles incomplete request bodies gracefully without throwing a server error.

---

#### TC_AUTH_004 — Verify the API rejects authentication when the request body is completely empty

**Priority:** High | **Tags:** `@regression`

**Preconditions:**
- Restful-Booker API is accessible

**Request Specification:**

| Property | Value |
|---|---|
| Method | POST |
| Endpoint | /auth |
| Content-Type | application/json |
| Auth Required | No |

**Request Schema:**

| Field | Type | Required | Test Value |
|---|---|---|---|
| username | string | Yes | (omitted) |
| password | string | Yes | (omitted) |

**Test Steps:**
1. Send a POST request to /auth with an empty request body `{}`
2. Verify that the response status code does not indicate a server crash (not 5xx for an empty body)
3. Verify that the response time is within the acceptable threshold
4. Verify that the response body contains a "reason" field
5. Verify that no "token" field is present in the response

**Validation Checks:**

| # | Layer | What to Check | Expected |
|---|---|---|---|
| 1 | Request Schema | Send completely empty JSON body `{}` | Schema violation sent |
| 2 | Status Code | HTTP response status is not a server error | 200 or 400 |
| 3 | Response Time | Time to receive full response | < 3000ms |
| 4 | Response Schema | "reason" field present | Present |
| 5 | Contract | "token" field absent | Absent |
| 6 | Business Logic | API handles empty body without crashing | No 5xx error |
| 7 | Header | Response Content-Type includes "application/json" | application/json |

**Expected Result:**
The API handles an empty request body gracefully. No authentication token is issued. The API does not return a 500 error, demonstrating robustness against malformed inputs.

---

### Module 2: GET Bookings

---

#### TC_GET_001 — Verify the API returns a list of all booking IDs

**Priority:** Critical | **Tags:** `@sanity` `@regression`

**Preconditions:**
- Restful-Booker API is accessible
- At least one booking exists in the system

**Request Specification:**

| Property | Value |
|---|---|
| Method | GET |
| Endpoint | /booking |
| Accept | application/json |
| Auth Required | No |
| Query Params | None |

**Test Steps:**
1. Send a GET request to /booking
2. Verify that the response status code is 200
3. Verify that the response time is within the acceptable threshold
4. Verify that the response body is a JSON array
5. Verify that the array contains at least one element
6. Verify that each element in the array contains a "bookingid" field
7. Verify that each "bookingid" value is a positive integer greater than zero

**Validation Checks:**

| # | Layer | What to Check | Expected |
|---|---|---|---|
| 1 | Status Code | HTTP response status | 200 |
| 2 | Response Time | Time to receive full response | < 3000ms |
| 3 | Response Schema | Response body is a JSON array | Array |
| 4 | Response Schema | Each element contains "bookingid" field | Present in every element |
| 5 | Response Schema | "bookingid" data type | integer |
| 6 | Contract | Array is non-empty (system has pre-existing data) | Length > 0 |
| 7 | Contract | "bookingid" values are positive integers | > 0 |
| 8 | Contract | No extra unexpected fields present in each array element | Only "bookingid" |
| 9 | Business Logic | All booking IDs in the list are individually retrievable via GET /booking/:id | Each returns 200 |
| 10 | Header | Response Content-Type includes "application/json" | application/json |

**Expected Result:**
The API returns HTTP 200 within 3000ms. The response is a non-empty JSON array. Each element contains exactly one field, "bookingid", which is a positive integer. The Content-Type header is application/json.

---

#### TC_GET_002 — Verify the API returns complete booking details for a valid booking ID

**Priority:** Critical | **Tags:** `@sanity` `@regression`

**Preconditions:**
- Restful-Booker API is accessible
- A valid booking ID is known (obtained from TC_GET_001 or test setup)

**Request Specification:**

| Property | Value |
|---|---|
| Method | GET |
| Endpoint | /booking/{id} |
| Accept | application/json |
| Auth Required | No |

**Test Data:**

| Field | Value |
|---|---|
| Booking ID | A known valid existing booking ID |

**Test Steps:**
1. Send a GET request to /booking to retrieve the list of booking IDs
2. Note a valid booking ID from the response
3. Send a GET request to /booking/{id} using the noted booking ID
4. Verify that the response status code is 200
5. Verify that the response time is within the acceptable threshold
6. Verify that the response contains a "firstname" field as a non-empty string
7. Verify that the response contains a "lastname" field as a non-empty string
8. Verify that the response contains a "totalprice" field as a number greater than or equal to 0
9. Verify that the response contains a "depositpaid" field as a boolean (true or false)
10. Verify that the response contains a "bookingdates" object
11. Verify that "bookingdates.checkin" is a string in YYYY-MM-DD format
12. Verify that "bookingdates.checkout" is a string in YYYY-MM-DD format
13. Verify that the checkin date is not after the checkout date

**Validation Checks:**

| # | Layer | What to Check | Expected |
|---|---|---|---|
| 1 | Status Code | HTTP response status | 200 |
| 2 | Response Time | Time to receive full response | < 3000ms |
| 3 | Response Schema | "firstname" is present and is a string | string |
| 4 | Response Schema | "lastname" is present and is a string | string |
| 5 | Response Schema | "totalprice" is present and is a number | number (>= 0) |
| 6 | Response Schema | "depositpaid" is present and is a boolean | boolean |
| 7 | Response Schema | "bookingdates" is present and is an object | object |
| 8 | Response Schema | "bookingdates.checkin" is present and is a string | string |
| 9 | Response Schema | "bookingdates.checkout" is present and is a string | string |
| 10 | Contract | "checkin" follows YYYY-MM-DD date format | YYYY-MM-DD |
| 11 | Contract | "checkout" follows YYYY-MM-DD date format | YYYY-MM-DD |
| 12 | Contract | "firstname" is not an empty string | Non-empty |
| 13 | Contract | "lastname" is not an empty string | Non-empty |
| 14 | Business Logic | checkin date is on or before checkout date | checkin <= checkout |
| 15 | Business Logic | "additionalneeds" may or may not be present — either is valid | string or absent |
| 16 | Header | Response Content-Type includes "application/json" | application/json |

**Expected Result:**
The API returns HTTP 200 within 3000ms. The response contains a complete booking object with all required fields present, correct data types, valid date formats, and a logically valid date range (checkin on or before checkout).

---

#### TC_GET_003 — Verify the API returns filtered bookings when queried by firstname

**Priority:** Medium | **Tags:** `@regression`

**Preconditions:**
- Restful-Booker API is accessible
- A booking with firstname "James" exists in the system (created in test setup)

**Request Specification:**

| Property | Value |
|---|---|
| Method | GET |
| Endpoint | /booking?firstname=James |
| Accept | application/json |
| Auth Required | No |

**Test Data:**

| Field | Value |
|---|---|
| Query Parameter | firstname=James |

**Test Steps:**
1. Send a GET request to /booking?firstname=James
2. Verify that the response status code is 200
3. Verify that the response time is within the acceptable threshold
4. Verify that the response body is a JSON array
5. For each booking ID returned, send a GET request to /booking/{id}
6. Verify that each individual booking's "firstname" field equals "James"

**Validation Checks:**

| # | Layer | What to Check | Expected |
|---|---|---|---|
| 1 | Status Code | HTTP response status | 200 |
| 2 | Response Time | Time to receive full response | < 3000ms |
| 3 | Response Schema | Response is a JSON array | Array |
| 4 | Contract | All returned booking IDs belong to bookings with firstname "James" | firstname = "James" for all |
| 5 | Business Logic | Filter is case-sensitive — "james" and "JAMES" return different results | Filter applied correctly |
| 6 | Business Logic | A booking with a different firstname is not included in the filtered results | Excluded correctly |
| 7 | Data Integrity | Booking IDs in filtered list match bookings created with firstname "James" in setup | IDs match |
| 8 | Header | Response Content-Type includes "application/json" | application/json |

**Expected Result:**
The API returns HTTP 200 within 3000ms. The filtered response contains only booking IDs corresponding to bookings with firstname "James". Bookings with other first names are excluded from the result.

---

#### TC_GET_004 — Verify the API returns 404 for a non-existent booking ID

**Priority:** High | **Tags:** `@regression`

**Preconditions:**
- Restful-Booker API is accessible
- Booking ID 999999 is confirmed not to exist in the system

**Request Specification:**

| Property | Value |
|---|---|
| Method | GET |
| Endpoint | /booking/999999 |
| Accept | application/json |
| Auth Required | No |

**Test Data:**

| Field | Value |
|---|---|
| Booking ID | 999999 (known non-existent) |

**Test Steps:**
1. Send a GET request to /booking/999999
2. Verify that the response status code is 404
3. Verify that the response time is within the acceptable threshold
4. Verify that the response body does not contain a valid booking object

**Validation Checks:**

| # | Layer | What to Check | Expected |
|---|---|---|---|
| 1 | Status Code | HTTP response status | 404 |
| 2 | Response Time | Time to receive full response | < 3000ms |
| 3 | Response Schema | No booking object fields present in response body | No booking data |
| 4 | Contract | API returns 404 for any ID that does not exist | 404 confirmed |
| 5 | Business Logic | No partial booking data is leaked for invalid IDs | Empty or "Not Found" body |
| 6 | Header | Response header is returned even for 404 | Headers present |

**Expected Result:**
The API returns HTTP 404 within 3000ms. No booking data is returned in the response body. The API correctly identifies that no booking exists for the given ID.

---

#### TC_GET_005 — Verify the API returns filtered bookings when queried by check-in and check-out dates

**Priority:** Medium | **Tags:** `@regression`

**Preconditions:**
- Restful-Booker API is accessible
- A booking with checkin "2025-06-01" and checkout "2025-06-10" exists in test setup

**Request Specification:**

| Property | Value |
|---|---|
| Method | GET |
| Endpoint | /booking?checkin=2025-06-01&checkout=2025-06-10 |
| Accept | application/json |
| Auth Required | No |

**Test Data:**

| Field | Value |
|---|---|
| checkin filter | 2025-06-01 |
| checkout filter | 2025-06-10 |

**Test Steps:**
1. Send a GET request to /booking?checkin=2025-06-01&checkout=2025-06-10
2. Verify that the response status code is 200
3. Verify that the response time is within the acceptable threshold
4. Verify that the response body is a JSON array
5. Verify that the booking created in setup appears in the filtered results

**Validation Checks:**

| # | Layer | What to Check | Expected |
|---|---|---|---|
| 1 | Status Code | HTTP response status | 200 |
| 2 | Response Time | Time to receive full response | < 3000ms |
| 3 | Response Schema | Response is a JSON array | Array |
| 4 | Contract | Query parameters "checkin" and "checkout" are accepted and applied | Filtered results |
| 5 | Business Logic | The setup booking with matching dates appears in the result | Booking ID present |
| 6 | Business Logic | Date format YYYY-MM-DD is the accepted filter format | Filter works |
| 7 | Header | Response Content-Type includes "application/json" | application/json |

**Expected Result:**
The API returns HTTP 200 within 3000ms. The response is a filtered JSON array that includes the booking matching the provided date range. Date-based filtering works correctly.

---

### Module 3: Create & Update Bookings

---

#### TC_CREATE_001 — Verify a new booking is created successfully with all fields provided

**Priority:** Critical | **Tags:** `@sanity` `@regression`

**Preconditions:**
- Restful-Booker API is accessible

**Request Specification:**

| Property | Value |
|---|---|
| Method | POST |
| Endpoint | /booking |
| Content-Type | application/json |
| Accept | application/json |
| Auth Required | No |

**Request Schema:**

| Field | Type | Required | Test Value |
|---|---|---|---|
| firstname | string | Yes | James |
| lastname | string | Yes | Brown |
| totalprice | integer | Yes | 150 |
| depositpaid | boolean | Yes | true |
| bookingdates.checkin | string (YYYY-MM-DD) | Yes | 2025-01-01 |
| bookingdates.checkout | string (YYYY-MM-DD) | Yes | 2025-01-07 |
| additionalneeds | string | No | Breakfast |

**Test Steps:**
1. Send a POST request to /booking with all the above fields in the request body
2. Verify that the response status code is 200
3. Verify that the response time is within the acceptable threshold
4. Verify that the response body contains a "bookingid" field with a positive integer value
5. Verify that the response "booking.firstname" equals "James"
6. Verify that the response "booking.lastname" equals "Brown"
7. Verify that the response "booking.totalprice" equals 150
8. Verify that the response "booking.depositpaid" equals true
9. Verify that the response "booking.bookingdates.checkin" equals "2025-01-01"
10. Verify that the response "booking.bookingdates.checkout" equals "2025-01-07"
11. Verify that the response "booking.additionalneeds" equals "Breakfast"

**Validation Checks:**

| # | Layer | What to Check | Expected |
|---|---|---|---|
| 1 | Request Schema | All required fields sent with correct types | Valid schema sent |
| 2 | Request Schema | "bookingdates" is a nested object with "checkin" and "checkout" | Nested object |
| 3 | Request Schema | "checkin" date (2025-01-01) is before "checkout" date (2025-01-07) | Valid date range |
| 4 | Status Code | HTTP response status | 200 |
| 5 | Response Time | Time to receive full response | < 3000ms |
| 6 | Response Schema | "bookingid" present and is a positive integer | integer > 0 |
| 7 | Response Schema | "booking" object present and contains all fields | All fields present |
| 8 | Response Schema | "booking.firstname" is a string | string |
| 9 | Response Schema | "booking.totalprice" is a number | number |
| 10 | Response Schema | "booking.depositpaid" is a boolean | boolean |
| 11 | Response Schema | "booking.bookingdates" is a nested object | object |
| 12 | Contract | "bookingid" is unique — differs from all previously returned IDs | Unique ID |
| 13 | Contract | "bookingid" is a new ID not seen in earlier GET /booking calls | New ID |
| 14 | Data Integrity | "booking.firstname" matches exactly what was sent ("James") | "James" |
| 15 | Data Integrity | "booking.lastname" matches exactly what was sent ("Brown") | "Brown" |
| 16 | Data Integrity | "booking.totalprice" matches exactly what was sent (150) | 150 |
| 17 | Data Integrity | "booking.depositpaid" matches exactly what was sent (true) | true |
| 18 | Data Integrity | "booking.bookingdates.checkin" matches "2025-01-01" | "2025-01-01" |
| 19 | Data Integrity | "booking.bookingdates.checkout" matches "2025-01-07" | "2025-01-07" |
| 20 | Data Integrity | "booking.additionalneeds" matches "Breakfast" | "Breakfast" |
| 21 | Business Logic | New booking is retrievable via GET /booking/{bookingid} | 200 on GET |
| 22 | Header | Response Content-Type includes "application/json" | application/json |

**Expected Result:**
The API returns HTTP 200 within 3000ms. The response contains a unique positive "bookingid" and a "booking" object where every submitted field is accurately reflected with the correct value and data type. The booking is persistently stored and retrievable via GET.

---

#### TC_CREATE_002 — Verify a booking is created successfully without the optional "additionalneeds" field

**Priority:** Medium | **Tags:** `@regression`

**Preconditions:**
- Restful-Booker API is accessible

**Request Specification:**

| Property | Value |
|---|---|
| Method | POST |
| Endpoint | /booking |
| Content-Type | application/json |
| Auth Required | No |

**Request Schema:**

| Field | Type | Required | Test Value |
|---|---|---|---|
| firstname | string | Yes | Alice |
| lastname | string | Yes | Cooper |
| totalprice | integer | Yes | 200 |
| depositpaid | boolean | Yes | false |
| bookingdates.checkin | string (YYYY-MM-DD) | Yes | 2025-05-01 |
| bookingdates.checkout | string (YYYY-MM-DD) | Yes | 2025-05-05 |
| additionalneeds | string | No | (intentionally omitted) |

**Test Steps:**
1. Send a POST request to /booking with all required fields but without the "additionalneeds" field
2. Verify that the response status code is 200
3. Verify that the response time is within the acceptable threshold
4. Verify that the response contains a valid "bookingid"
5. Verify that all required fields in the response match the submitted values
6. Verify that the absence of "additionalneeds" in the request does not cause an error

**Validation Checks:**

| # | Layer | What to Check | Expected |
|---|---|---|---|
| 1 | Request Schema | All required fields present, optional field intentionally omitted | Valid partial schema |
| 2 | Status Code | HTTP response status | 200 |
| 3 | Response Time | Time to receive full response | < 3000ms |
| 4 | Response Schema | "bookingid" present and positive | integer > 0 |
| 5 | Response Schema | All required booking fields present in response | All present |
| 6 | Contract | Omitting optional "additionalneeds" does not cause rejection | No error |
| 7 | Data Integrity | "firstname" = "Alice", "lastname" = "Cooper", "totalprice" = 200, "depositpaid" = false | All match |
| 8 | Business Logic | Booking is retrievable via GET /booking/{bookingid} | 200 on GET |
| 9 | Header | Response Content-Type includes "application/json" | application/json |

**Expected Result:**
The API returns HTTP 200. The optional "additionalneeds" field is not required for a valid booking. All required fields are correctly saved. The booking is retrievable via its new bookingid.

---

#### TC_CREATE_003 — Verify the API rejects booking creation when the required "firstname" field is missing

**Priority:** High | **Tags:** `@regression`

**Preconditions:**
- Restful-Booker API is accessible

**Request Specification:**

| Property | Value |
|---|---|
| Method | POST |
| Endpoint | /booking |
| Content-Type | application/json |
| Auth Required | No |

**Request Schema:**

| Field | Type | Required | Test Value |
|---|---|---|---|
| firstname | string | Yes | (intentionally omitted) |
| lastname | string | Yes | Brown |
| totalprice | integer | Yes | 150 |
| depositpaid | boolean | Yes | true |
| bookingdates.checkin | string | Yes | 2025-01-01 |
| bookingdates.checkout | string | Yes | 2025-01-07 |

**Test Steps:**
1. Send a POST request to /booking with the "firstname" field omitted from the request body
2. Verify that the response status code indicates an error (400 or 500)
3. Verify that the response time is within the acceptable threshold
4. Verify that no valid "bookingid" is returned in the response

**Validation Checks:**

| # | Layer | What to Check | Expected |
|---|---|---|---|
| 1 | Request Schema | Schema violation — required field "firstname" is absent | Schema invalid |
| 2 | Status Code | HTTP response status is an error code | 400 or 500 |
| 3 | Response Time | Time to receive full response | < 3000ms |
| 4 | Response Schema | Response does not contain a "bookingid" | Absent |
| 5 | Contract | API must reject requests missing required fields | Rejection confirmed |
| 6 | Business Logic | No booking record is created in the system when required fields are missing | No record created |
| 7 | Business Logic | A GET /booking call after this test does not include a new ID from this failed request | Integrity preserved |

**Expected Result:**
The API returns an error status code (400 or 500) within 3000ms. No booking is created. The response does not contain a "bookingid". The system remains unaffected by the invalid request.

---

#### TC_CREATE_004 — Verify the API handles booking creation when checkin date is after checkout date

**Priority:** High | **Tags:** `@regression`

**Preconditions:**
- Restful-Booker API is accessible

**Request Specification:**

| Property | Value |
|---|---|
| Method | POST |
| Endpoint | /booking |
| Content-Type | application/json |
| Auth Required | No |

**Request Schema:**

| Field | Type | Required | Test Value |
|---|---|---|---|
| firstname | string | Yes | Test |
| lastname | string | Yes | User |
| totalprice | integer | Yes | 100 |
| depositpaid | boolean | Yes | true |
| bookingdates.checkin | string (YYYY-MM-DD) | Yes | 2025-12-31 (after checkout) |
| bookingdates.checkout | string (YYYY-MM-DD) | Yes | 2025-01-01 (before checkin) |

**Test Steps:**
1. Send a POST request to /booking where "checkin" date (2025-12-31) is after "checkout" date (2025-01-01)
2. Verify the response status code
3. Verify the response time is within the acceptable threshold
4. Verify the business logic enforcement behaviour — either rejection or an accepted booking with logically invalid dates (document which behaviour the API exhibits)

**Validation Checks:**

| # | Layer | What to Check | Expected |
|---|---|---|---|
| 1 | Request Schema | Request is structurally valid (all fields present, correct types) | Structurally valid |
| 2 | Status Code | HTTP response status | 400 (if validated) or 200 (if not) |
| 3 | Response Time | Time to receive full response | < 3000ms |
| 4 | Contract | API documents whether it enforces date ordering | Behaviour documented |
| 5 | Business Logic | checkin after checkout is logically invalid | Should be rejected |
| 6 | Business Logic | If accepted — document this as a known API limitation | Bug noted if 200 returned |

**Expected Result:**
Ideally, the API returns 400 rejecting the logically invalid date range. If the API returns 200, this is a known limitation to be documented — the API does not enforce date ordering. Either behaviour must be confirmed and recorded.

---

#### TC_UPDATE_001 — Verify a booking is fully updated with a valid auth token

**Priority:** Critical | **Tags:** `@regression`

**Preconditions:**
- A valid auth token is available (obtained via POST /auth)
- A booking has been created in test setup and its bookingid is known

**Request Specification:**

| Property | Value |
|---|---|
| Method | PUT |
| Endpoint | /booking/{bookingid} |
| Content-Type | application/json |
| Accept | application/json |
| Auth Required | Yes — Cookie: token={token} |

**Request Schema:**

| Field | Type | Required | Test Value |
|---|---|---|---|
| firstname | string | Yes | Updated |
| lastname | string | Yes | User |
| totalprice | integer | Yes | 200 |
| depositpaid | boolean | Yes | false |
| bookingdates.checkin | string (YYYY-MM-DD) | Yes | 2025-03-01 |
| bookingdates.checkout | string (YYYY-MM-DD) | Yes | 2025-03-05 |

**Test Steps:**
1. Send a PUT request to /booking/{bookingid} with the auth token in the Cookie header and the updated fields in the request body
2. Verify that the response status code is 200
3. Verify that the response time is within the acceptable threshold
4. Verify that the response "firstname" equals "Updated"
5. Verify that the response "totalprice" equals 200
6. Verify that the response "depositpaid" equals false
7. Verify that the response "bookingdates.checkin" equals "2025-03-01"
8. Send a GET request to /booking/{bookingid} to confirm the updates are persisted in the system
9. Verify that the GET response reflects all updated values

**Validation Checks:**

| # | Layer | What to Check | Expected |
|---|---|---|---|
| 1 | Request Schema | All required fields present in PUT body (PUT requires the full object, not partial) | Full object sent |
| 2 | Request Schema | Cookie header contains "token={valid_token}" | Auth header present |
| 3 | Status Code | HTTP response status | 200 |
| 4 | Response Time | Time to receive full response | < 3000ms |
| 5 | Response Schema | Full booking object returned (not a wrapper like CreateBooking) | Direct booking object |
| 6 | Response Schema | All booking fields present with correct types | All present |
| 7 | Contract | PUT replaces the entire booking record (not a partial update) | All fields overwritten |
| 8 | Data Integrity | "firstname" in response equals "Updated" | "Updated" |
| 9 | Data Integrity | "totalprice" in response equals 200 | 200 |
| 10 | Data Integrity | "depositpaid" in response equals false | false |
| 11 | Data Integrity | "bookingdates.checkin" equals "2025-03-01" | "2025-03-01" |
| 12 | Business Logic | Changes are persisted — GET /booking/{id} after PUT returns the updated data | Persisted |
| 13 | Business Logic | Auth token is mandatory — request without token returns 403 | 403 without auth |
| 14 | Header | Response Content-Type includes "application/json" | application/json |

**Expected Result:**
The API returns HTTP 200 within 3000ms. The PUT response reflects all updated field values. A subsequent GET request confirms the changes are persisted in the database. The auth token is correctly enforced.

---

#### TC_UPDATE_002 — Verify a booking update is rejected when no auth token is provided

**Priority:** High | **Tags:** `@regression`

**Preconditions:**
- A booking has been created and its bookingid is known
- No auth token is used in this test

**Request Specification:**

| Property | Value |
|---|---|
| Method | PUT |
| Endpoint | /booking/{bookingid} |
| Content-Type | application/json |
| Auth Required | Yes (intentionally omitted to test rejection) |

**Request Schema:**

| Field | Type | Required | Test Value |
|---|---|---|---|
| firstname | string | Yes | Unauthorized |
| lastname | string | Yes | Update |
| totalprice | integer | Yes | 999 |
| depositpaid | boolean | Yes | true |
| bookingdates.checkin | string | Yes | 2025-04-01 |
| bookingdates.checkout | string | Yes | 2025-04-05 |

**Test Steps:**
1. Send a PUT request to /booking/{bookingid} with a valid request body but without the Cookie auth header
2. Verify that the response status code is 403
3. Verify that the response time is within the acceptable threshold
4. Send a GET request to /booking/{bookingid} to confirm the booking data has not changed
5. Verify that the GET response still contains the original booking data (not the update values)

**Validation Checks:**

| # | Layer | What to Check | Expected |
|---|---|---|---|
| 1 | Status Code | HTTP response status without auth | 403 |
| 2 | Response Time | Time to receive full response | < 3000ms |
| 3 | Contract | API enforces authentication for all PUT operations | 403 returned |
| 4 | Business Logic | Booking data is not modified when request is unauthenticated | Original data intact |
| 5 | Business Logic | A GET after the failed PUT still returns the original booking values | GET = original values |
| 6 | Business Logic | Using an expired or invalid token also results in 403 | 403 for bad tokens |

**Expected Result:**
The API returns HTTP 403 Forbidden. The booking data remains unchanged. A subsequent GET request confirms the original data is intact. Authentication is correctly enforced for update operations.

---

#### TC_UPDATE_003 — Verify a booking can be partially updated using PATCH with a valid auth token

**Priority:** Medium | **Tags:** `@regression`

**Preconditions:**
- A valid auth token is available
- A booking has been created in test setup and its bookingid is known

**Request Specification:**

| Property | Value |
|---|---|
| Method | PATCH |
| Endpoint | /booking/{bookingid} |
| Content-Type | application/json |
| Accept | application/json |
| Auth Required | Yes — Cookie: token={token} |

**Request Schema (partial — only fields being updated):**

| Field | Type | Required | Test Value |
|---|---|---|---|
| firstname | string | No (partial) | PatchedName |
| totalprice | integer | No (partial) | 750 |

**Test Steps:**
1. Send a PATCH request to /booking/{bookingid} with only "firstname" and "totalprice" fields in the request body and the auth token in the Cookie header
2. Verify that the response status code is 200
3. Verify that the response time is within the acceptable threshold
4. Verify that the response "firstname" equals "PatchedName"
5. Verify that the response "totalprice" equals 750
6. Verify that the response "lastname" and other fields still contain the original values (unchanged)
7. Send a GET request to /booking/{bookingid} to confirm the partial update is persisted

**Validation Checks:**

| # | Layer | What to Check | Expected |
|---|---|---|---|
| 1 | Request Schema | Only the fields to be updated are sent (partial schema) | Partial object sent |
| 2 | Status Code | HTTP response status | 200 |
| 3 | Response Time | Time to receive full response | < 3000ms |
| 4 | Response Schema | Full booking object is returned after PATCH | Full object |
| 5 | Contract | PATCH only modifies the fields that were sent | Partial update confirmed |
| 6 | Data Integrity | "firstname" = "PatchedName" in response | "PatchedName" |
| 7 | Data Integrity | "totalprice" = 750 in response | 750 |
| 8 | Data Integrity | "lastname" and other unpatched fields remain unchanged | Original values |
| 9 | Business Logic | Partial update is persisted — confirmed via GET | GET reflects changes |
| 10 | Header | Response Content-Type includes "application/json" | application/json |

**Expected Result:**
The API returns HTTP 200. Only the "firstname" and "totalprice" fields are updated. All other fields retain their original values. The partial update is confirmed to be persisted via a subsequent GET request.

---

### Module 4: Delete Booking

---

#### TC_DELETE_001 — Verify a booking is successfully deleted with a valid auth token

**Priority:** Critical | **Tags:** `@sanity` `@regression`

**Preconditions:**
- A valid auth token is available
- A booking has been created in test setup and its bookingid is known

**Request Specification:**

| Property | Value |
|---|---|
| Method | DELETE |
| Endpoint | /booking/{bookingid} |
| Auth Required | Yes — Cookie: token={token} |

**Test Data:**

| Field | Value |
|---|---|
| Auth Token | Valid token obtained from POST /auth |
| Booking ID | A known valid booking ID created in test setup |

**Test Steps:**
1. Send a DELETE request to /booking/{bookingid} with the valid auth token in the Cookie header
2. Verify that the response status code is 201
3. Verify that the response time is within the acceptable threshold
4. Send a GET request to /booking/{bookingid} to confirm the booking has been removed
5. Verify that the GET response status code is 404

**Validation Checks:**

| # | Layer | What to Check | Expected |
|---|---|---|---|
| 1 | Status Code | HTTP response status for DELETE | 201 |
| 2 | Response Time | Time to receive full DELETE response | < 3000ms |
| 3 | Contract | API returns 201 (not 200 or 204) for successful deletion — this is the documented contract | 201 |
| 4 | Business Logic | Auth token is mandatory for DELETE operations | Token required |
| 5 | Business Logic | Booking is permanently removed from the system after deletion | Not retrievable |
| 6 | Business Logic | Subsequent GET /booking/{id} returns 404 after successful deletion | 404 confirmed |
| 7 | Business Logic | Deleted booking ID does not appear in GET /booking list | Absent from list |
| 8 | Data Integrity | No booking data is returned or leaked after deletion | Empty body |
| 9 | Header | Response headers are present even for 201 | Headers returned |

**Expected Result:**
The API returns HTTP 201 within 3000ms for the DELETE request. A subsequent GET request for the same booking ID returns HTTP 404. The booking is permanently removed. The deleted booking ID no longer appears in the GET /booking list.

---

#### TC_DELETE_002 — Verify a booking deletion is rejected when no auth token is provided

**Priority:** High | **Tags:** `@regression`

**Preconditions:**
- A booking has been created and its bookingid is known
- No auth token is used in this test

**Request Specification:**

| Property | Value |
|---|---|
| Method | DELETE |
| Endpoint | /booking/{bookingid} |
| Auth Required | Yes (intentionally omitted to test rejection) |

**Test Data:**

| Field | Value |
|---|---|
| Auth Token | (intentionally not included in headers) |

**Test Steps:**
1. Send a DELETE request to /booking/{bookingid} without any auth token in the request headers
2. Verify that the response status code is 403
3. Verify that the response time is within the acceptable threshold
4. Send a GET request to /booking/{bookingid} to confirm the booking was not deleted
5. Verify that the GET response status code is 200 and the booking data is intact

**Validation Checks:**

| # | Layer | What to Check | Expected |
|---|---|---|---|
| 1 | Status Code | HTTP response status without auth | 403 |
| 2 | Response Time | Time to receive full response | < 3000ms |
| 3 | Contract | API enforces authentication for all DELETE operations | 403 returned |
| 4 | Business Logic | Booking is not deleted when request is unauthenticated | Booking still exists |
| 5 | Business Logic | GET /booking/{id} after the failed DELETE returns 200 | 200 confirmed |
| 6 | Business Logic | Original booking data is fully intact after the failed delete attempt | Data unchanged |
| 7 | Business Logic | Sending an empty or invalid token also results in 403 | 403 for bad tokens |

**Expected Result:**
The API returns HTTP 403 Forbidden. The booking remains in the system. A subsequent GET request confirms the original data is intact. Authentication is correctly enforced for all delete operations.

---

#### TC_DELETE_003 — Verify the API returns an error when deleting a non-existent booking ID

**Priority:** Medium | **Tags:** `@regression`

**Preconditions:**
- A valid auth token is available
- Booking ID 999999 is confirmed as non-existent

**Request Specification:**

| Property | Value |
|---|---|
| Method | DELETE |
| Endpoint | /booking/999999 |
| Auth Required | Yes — Cookie: token={token} |

**Test Data:**

| Field | Value |
|---|---|
| Booking ID | 999999 (known non-existent) |
| Auth Token | Valid token from POST /auth |

**Test Steps:**
1. Send a DELETE request to /booking/999999 with a valid auth token in the Cookie header
2. Verify that the response status code is 405
3. Verify that the response time is within the acceptable threshold

**Validation Checks:**

| # | Layer | What to Check | Expected |
|---|---|---|---|
| 1 | Status Code | HTTP response status for non-existent ID | 405 |
| 2 | Response Time | Time to receive full response | < 3000ms |
| 3 | Contract | API returns 405 (not 404) for delete on a non-existent ID — document this behaviour | 405 |
| 4 | Business Logic | Auth is still validated even when the resource does not exist | Auth required |
| 5 | Business Logic | API does not throw an unhandled server error | No 500 |

**Expected Result:**
The API returns HTTP 405 within 3000ms. No server error occurs. The non-standard status code (405 instead of 404) is the documented behaviour of this API for deleting non-existent resources.

---

### E2E: Full Booking Lifecycle

---

#### TC_E2E_API_001 — Verify the complete booking lifecycle: Create, Verify, Update, Verify, Delete, Confirm Deleted

**Priority:** Critical | **Tags:** `@sanity` `@regression`

**Preconditions:**
- Restful-Booker API is accessible at https://restful-booker.herokuapp.com

**Test Data:**

| Field | Value |
|---|---|
| Auth username | admin |
| Auth password | password123 |
| firstname | E2E |
| lastname | Test |
| totalprice | 300 |
| depositpaid | true |
| checkin | 2025-06-01 |
| checkout | 2025-06-10 |
| additionalneeds | Dinner |
| Updated firstname | E2E-Updated |
| Updated totalprice | 999 |

**Test Steps:**
1. Send a POST request to /auth with username "admin" and password "password123"
2. Verify that the response status code is 200 and store the returned auth token
3. Send a POST request to /booking with all the test data fields above
4. Verify that the response status code is 200 and store the returned "bookingid"
5. Send a GET request to /booking/{bookingid}
6. Verify that the GET response status code is 200, "firstname" equals "E2E", and "totalprice" equals 300
7. Send a PUT request to /booking/{bookingid} with the auth token, updating "firstname" to "E2E-Updated" and "totalprice" to 999
8. Verify that the PUT response status code is 200 and "firstname" equals "E2E-Updated"
9. Send a GET request to /booking/{bookingid} to verify the update is persisted
10. Verify that the GET response "firstname" equals "E2E-Updated" and "totalprice" equals 999
11. Send a DELETE request to /booking/{bookingid} with the auth token
12. Verify that the DELETE response status code is 201
13. Send a GET request to /booking/{bookingid} to confirm deletion
14. Verify that the GET response status code is 404

**Validation Checks:**

| # | Step | Layer | What to Check | Expected |
|---|---|---|---|---|
| 1 | Auth | Status Code | POST /auth response status | 200 |
| 2 | Auth | Response Schema | "token" field present and non-empty | Non-empty string |
| 3 | Auth | Response Time | Auth response time | < 3000ms |
| 4 | Create | Status Code | POST /booking response status | 200 |
| 5 | Create | Response Schema | "bookingid" present as positive integer | integer > 0 |
| 6 | Create | Response Schema | "booking" object contains all submitted fields | All present |
| 7 | Create | Data Integrity | All submitted values are reflected accurately in the response | All match |
| 8 | Create | Response Time | Create response time | < 3000ms |
| 9 | GET (verify create) | Status Code | GET /booking/{id} after create | 200 |
| 10 | GET (verify create) | Data Integrity | "firstname" = "E2E", "totalprice" = 300 from GET | Match |
| 11 | GET (verify create) | Response Schema | Full booking schema present in GET response | All fields |
| 12 | PUT (update) | Status Code | PUT /booking/{id} response status | 200 |
| 13 | PUT (update) | Contract | Auth token in Cookie header is required for PUT | Enforced |
| 14 | PUT (update) | Data Integrity | "firstname" = "E2E-Updated" in PUT response | "E2E-Updated" |
| 15 | PUT (update) | Data Integrity | "totalprice" = 999 in PUT response | 999 |
| 16 | PUT (update) | Response Time | Update response time | < 3000ms |
| 17 | GET (verify update) | Status Code | GET /booking/{id} after update | 200 |
| 18 | GET (verify update) | Data Integrity | "firstname" = "E2E-Updated" persisted in GET | "E2E-Updated" |
| 19 | GET (verify update) | Data Integrity | "totalprice" = 999 persisted in GET | 999 |
| 20 | DELETE | Status Code | DELETE /booking/{id} response status | 201 |
| 21 | DELETE | Contract | Auth token in Cookie header is required for DELETE | Enforced |
| 22 | DELETE | Response Time | Delete response time | < 3000ms |
| 23 | GET (verify delete) | Status Code | GET /booking/{id} after delete | 404 |
| 24 | GET (verify delete) | Business Logic | Booking is fully removed — no data returned | 404, no body |

**Expected Result:**
The entire booking lifecycle completes successfully without errors. The booking is created with correct data, verified via GET, updated and changes persist on re-fetch, deleted with a 201 response, and confirmed as deleted with a 404 on the final GET. All 14 steps pass.

---

## Test Case Summary

| Suite | Module | Positive | Negative | E2E | Total |
|---|---|---|---|---|---|
| Web | Login | 1 | 4 | — | 5 |
| Web | Product Catalog | 3 | 1 | — | 4 |
| Web | Cart & Checkout | 1 | 2 | 1 | 4 |
| **Web Total** | | **5** | **7** | **1** | **13** |
| API | Authentication (POST /auth) | 1 | 3 | — | 4 |
| API | GET Bookings | 3 | 2 | — | 5 |
| API | Create Booking (POST) | 2 | 2 | — | 4 |
| API | Update Booking (PUT/PATCH) | 2 | 1 | — | 3 |
| API | Delete Booking (DELETE) | 1 | 2 | — | 3 |
| API | E2E Lifecycle | — | — | 1 | 1 |
| **API Total** | | **9** | **10** | **1** | **20** |
| **Grand Total** | | **14** | **17** | **2** | **33** |

---

## Validation Coverage Summary — API

Every API test case covers these 8 validation layers:

| Layer | Description | Applied In |
|---|---|---|
| L1 — Request Schema | Fields, types, required vs optional enforced before sending | All test cases |
| L2 — Status Code | HTTP status matches expected for each scenario | All test cases |
| L3 — Response Time | Response received within 3000ms | All test cases |
| L4 — Response Schema | All expected response fields present with correct data types | All test cases |
| L5 — Contract | API honours its documented field semantics and behavioural rules | All test cases |
| L6 — Business Logic | Auth enforcement, date ordering, mandatory field rules | All test cases |
| L7 — Data Integrity | Submitted values accurately stored and returned | Create/Update test cases |
| L8 — Header | Content-Type and other response headers correct | All test cases |
