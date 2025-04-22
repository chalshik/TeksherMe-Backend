# Categories API Architecture

## Backend (Django REST Framework)

### Models (`categories/models.py`)
- `Category` model has a simple structure with just a name field
- Fields: `id` (auto-generated), `name` (CharField)

### Serializers (`categories/serializers.py`)
- `CategorySerializer` uses ModelSerializer for automatic serialization
- Uses `fields = '__all__'` to include all model fields (id and name)

### Views (`categories/views.py`)
- Uses a `CategoryViewSet` inheriting from `viewsets.ModelViewSet`
- Provides standard CRUD operations (list, create, retrieve, update, destroy)
- Decorates the view with `@method_decorator(csrf_exempt, name='dispatch')`

### URLs (`categories/urls.py`)
- Uses Django REST Framework's `DefaultRouter`
- Registers the `CategoryViewSet` with a prefix of 'categories'
- The router automatically generates URLs for all CRUD operations

### Main URL Configuration (`TeksherMe_backend/urls.py`)
- Categories API is mounted at: `/api/v1/categories/`
- This produces the following endpoints:
  - List/Create: `GET/POST /api/v1/categories/categories/`
  - Detail/Update/Delete: `GET/PUT/DELETE /api/v1/categories/categories/{id}/`
  - Root API view: `GET /api/v1/categories/` (provides link to categories list)

## Frontend (React)

### API Service (`website/src/services/api.js`)
- Uses Axios for HTTP requests
- Base URL set to `http://localhost:8000/api/v1`
- Provides functions for CRUD operations:
  - `getCategories()` - fetches categories list
  - `getCategory(id)` - fetches a specific category
  - `addCategory(categoryData)` - creates a new category
  - `updateCategory(id, categoryData)` - updates a category
  - `deleteCategory(id)` - deletes a category
- Includes mock data for offline development

### CategoryManager Component (`website/src/pages/CategoryManager.js`)
- State management for categories list, editing, and loading states
- Uses API service functions to perform CRUD operations
- Handles form submission for adding/editing categories
- Provides UI for managing categories with add/edit/delete functionality

## Data Flow

1. When CategoryManager mounts, it calls `fetchCategories()` which uses the `getCategories()` API function
2. The API request goes to `http://localhost:8000/api/v1/categories/` and redirects to `http://localhost:8000/api/v1/categories/categories/`
3. The Django backend processes the request through the CategoryViewSet's `list` method
4. The list method serializes all categories using CategorySerializer and returns JSON
5. The React component receives the data and updates its state

## URLs Summary
- Backend API root: `http://localhost:8000/api/v1/categories/`
- Categories list: `http://localhost:8000/api/v1/categories/categories/`
- Single category: `http://localhost:8000/api/v1/categories/categories/{id}/`
- Frontend UI: `http://localhost:8000/website/categories` (React route) 