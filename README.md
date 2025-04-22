# TeksherMe Backend API

This is the REST API backend for the TeksherMe application, built with Django and Django REST Framework.

## API Endpoints

### Base URL: `/api/v1/`

### 1. Categories API

| Endpoint | Method | Description | Query Parameters |
|----------|--------|-------------|------------------|
| `/api/v1/categories/categories/` | GET | List all categories | None |
| `/api/v1/categories/categories/` | POST | Create a new category | None |
| `/api/v1/categories/categories/{id}/` | GET | Get a specific category by ID | None |
| `/api/v1/categories/categories/{id}/` | PUT | Update a category | None |
| `/api/v1/categories/categories/{id}/` | DELETE | Delete a category | None |

### 2. TestSets API

| Endpoint | Method | Description | Query Parameters |
|----------|--------|-------------|------------------|
| `/api/v1/testsets/testsets/` | GET | List all test sets | `category_id`, `difficulty`, `search` |
| `/api/v1/testsets/testsets/` | POST | Create a new test set | None |
| `/api/v1/testsets/testsets/{id}/` | GET | Get a specific test set | None |
| `/api/v1/testsets/testsets/{id}/` | PUT | Update a test set | None |
| `/api/v1/testsets/testsets/{id}/` | DELETE | Delete a test set | None |
| `/api/v1/testsets/questions/` | GET | List all questions | `testset_id` |
| `/api/v1/testsets/questions/` | POST | Create a new question | None |
| `/api/v1/testsets/questions/{id}/` | GET | Get a specific question | None |
| `/api/v1/testsets/questions/{id}/` | PUT | Update a question | None |
| `/api/v1/testsets/questions/{id}/` | DELETE | Delete a question | None |
| `/api/v1/testsets/options/` | GET | List all options | `question_id` |
| `/api/v1/testsets/options/` | POST | Create a new option | None |
| `/api/v1/testsets/options/{id}/` | GET | Get a specific option | None |
| `/api/v1/testsets/options/{id}/` | PUT | Update an option | None |
| `/api/v1/testsets/options/{id}/` | DELETE | Delete an option | None |

### 3. Attempts API

| Endpoint | Method | Description | Query Parameters |
|----------|--------|-------------|------------------|
| `/api/v1/attempts/attempts/` | GET | List all test attempts | `testset_id` |
| `/api/v1/attempts/attempts/` | POST | Create a new test attempt | None |
| `/api/v1/attempts/attempts/{id}/` | GET | Get a specific test attempt | None |
| `/api/v1/attempts/attempts/{id}/` | PUT | Update a test attempt | None |
| `/api/v1/attempts/attempts/{id}/` | DELETE | Delete a test attempt | None |
| `/api/v1/attempts/answers/` | GET | List all answers | `attempt_id` |
| `/api/v1/attempts/answers/` | POST | Create a new answer | None |
| `/api/v1/attempts/answers/{id}/` | GET | Get a specific answer | None |
| `/api/v1/attempts/answers/{id}/` | PUT | Update an answer | None |
| `/api/v1/attempts/answers/{id}/` | DELETE | Delete an answer | None |

### 4. Bookmarks API

| Endpoint | Method | Description | Query Parameters |
|----------|--------|-------------|------------------|
| `/api/v1/bookmarks/question-bookmarks/` | GET | List all question bookmarks | `testset_id`, `question_id` |
| `/api/v1/bookmarks/question-bookmarks/` | POST | Create a new question bookmark | None |
| `/api/v1/bookmarks/question-bookmarks/{id}/` | GET | Get a specific question bookmark | None |
| `/api/v1/bookmarks/question-bookmarks/{id}/` | PUT | Update a question bookmark | None |
| `/api/v1/bookmarks/question-bookmarks/{id}/` | DELETE | Delete a question bookmark | None |
| `/api/v1/bookmarks/testset-bookmarks/` | GET | List all test set bookmarks | `testset_id` |
| `/api/v1/bookmarks/testset-bookmarks/` | POST | Create a new test set bookmark | None |
| `/api/v1/bookmarks/testset-bookmarks/{id}/` | GET | Get a specific test set bookmark | None |
| `/api/v1/bookmarks/testset-bookmarks/{id}/` | PUT | Update a test set bookmark | None |
| `/api/v1/bookmarks/testset-bookmarks/{id}/` | DELETE | Delete a test set bookmark | None |

## Filtering Options

- **TestSets:** Can be filtered by `category_id`, `difficulty` (case-insensitive), and `search` terms (searches in title and description)
- **Questions:** Can be filtered by `testset_id`
- **Options:** Can be filtered by `question_id`
- **Test Attempts:** Can be filtered by `testset_id`
- **Answers:** Can be filtered by `attempt_id`
- **Question Bookmarks:** Can be filtered by `testset_id` and `question_id`
- **TestSet Bookmarks:** Can be filtered by `testset_id`

## Authentication

Authentication is handled via Django REST Framework's built-in authentication system, accessible through `/api-auth/` endpoints.

## Running the API

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run migrations:
   ```
   python manage.py migrate
   ```

3. Start the development server:
   ```
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/api/v1/`.
