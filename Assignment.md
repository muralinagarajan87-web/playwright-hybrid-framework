Lead SDET - Technical Assignment

Context
You have been deployed to an enterprise B2B SaaS project as the Lead SDET. The
immediate priority is to establish a robust test automation framework from scratch to
reduce the current 1-week manual regression cycle performed by 10 QA engineers.
You will lead a team of 3 strong SDETs. Your solution must demonstrate:
• Scalability - Handle growing test suites efficiently
• Maintainability - Easy to update and extend
• Modularity - Clear separation of concerns
• Team Enablement - Quick onboarding for team members

Assignment Overview
Implement test automation for both Web UI and API testing with complete framework
setup, CI/CD integration, and comprehensive documentation.
Timeline: 3 days (or one weekend)
Note: You are encouraged to use any tools, techniques, or AI assistance to complete
this assignment. And it's your choice to create multiple repositories or a single
repository for both Web and API.

Part 1: Web UI Automation
Application Under Test
URL: https://www.saucedemo.com/
Test Users: Available on the login page
Scope - Modules to Automate
1. Login Module
• Positive: Successful login with valid credentials
• Negative: Login failure with invalid credentials
2. Product Catalog

• Positive: Successfully add product to cart
• Negative: Verify behavior with invalid product interactions
3. Shopping Cart/Checkout
• Positive: Complete checkout flow
• Negative: Validation errors in checkout form
Technical Requirements
• Framework: Playwright + TypeScript
• Test Coverage: Minimum 1 positive + 1 negative test per module (6 tests
minimum)
• E2E Test: 1 End-to-End test (Login → Add to Cart → Checkout)
• Design Patterns: Implement appropriate patterns
• CI/CD: GitHub Actions integration with automated test execution
Deliverables
• GitHub repository link with complete source code
• Tests successfully running on GitHub Actions
• Comprehensive README with:
- Setup instructions
- How to run tests locally
- Framework architecture explanation
- Team onboarding guide
- CI/CD pipeline details

Part 2: API Automation
API Under Test
Restful-Booker API: https://restful-booker.herokuapp.com/
Documentation: API Documentation
Scope - Endpoints to Automate
1. Authentication
• POST /auth
• Positive & Negative scenarios
2. Booking Management - GET
• GET /booking
• GET /booking/:id
• Positive & Negative scenarios

3. Booking Management - CREATE/UPDATE
• POST /booking
• PUT /booking/:id
• Positive & Negative scenarios
4. Booking Management - DELETE
• DELETE /booking/:id
• Positive & Negative scenarios
Technical Requirements
• Framework: TypeScript (choose appropriate libraries)
• Test Coverage: Minimum 1 positive + 1 negative test per endpoint category
• E2E Test: 1 End-to-End test (Create → Update → Verify → Delete)
• Validation: Response status, schema, data integrity
• CI/CD: GitHub Actions integration
Deliverables
• GitHub repository with complete source code
• Tests successfully running on GitHub Actions
• Comprehensive README with:
- Setup instructions
- How to run tests locally
- Framework architecture explanation
- API test strategy
- Team onboarding guide

Submission Guidelines
1. Ensure repositories are PUBLIC
2. Submit repository links to: [HR contact email]
3. Deadline: [Specific date and time]

Frequently Asked Questions
Q: Can I use AI tools like GitHub Copilot, ChatGPT, or Claude?
A: Absolutely! We encourage using all available tools to solve problems efficiently.
Q: Can I use different libraries/frameworks than suggested?
A: Playwright and TypeScript are mandatory for web testing. For API testing, TypeScript
is mandatory, but you can choose libraries.

Q: Should I include both repositories in one or keep them separate?
A: It's your choice however you should be able to justify your choice.
Q: What if I don't finish everything?
A: Submit whatever you complete. Partial submission with quality is better than rushed
complete submission.
Q: Can I add additional features beyond requirements?
A: Yes! Showcase your skills, but ensure core requirements are met first.