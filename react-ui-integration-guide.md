# React UI Integration Guide for Classes Module

This guide explains how to integrate the classes API endpoints with your React application. We'll cover TypeScript interfaces, API calls, and UI implementation examples.

## TypeScript Interfaces

First, let's review the TypeScript interfaces we created in `src/types/classes.ts`:

### `Class` Interface
Represents a single class object:
```typescript
interface Class {
  _id: string;
  name: string;
  description: string;
  courseId: string;
  classTeacherId: string;
  studentIds: string[];
  organizationId: string;
  schedule: ClassSchedule[];
  classroom: string;
  credits: number;
  maxCapacity: number;
  currentEnrollment: number;
  supervisorId: string;
  academicYear: string;
  departmentId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}
```

### Response Types
- `ClassListResponse`: For fetching multiple classes with pagination
- `CreateClassRequest`: For creating a new class
- `UpdateClassRequest`: For updating an existing class
- `StudentsInClassResponse`: For fetching students in a specific class
- `ClassStatsResponse`: For class statistics

## API Integration

### Base API Call Configuration

Create a utility function to handle API calls with proper error handling:

```typescript
// src/utils/api.ts
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const accessToken = localStorage.getItem('accessToken');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`/api/v1${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};
```

### Classes API Functions

Create specific API functions for classes operations:

```typescript
// src/services/classes.service.ts
import { apiCall } from '../utils/api';
import {
  Class,
  ClassListResponse,
  CreateClassRequest,
  UpdateClassRequest,
  StudentsInClassResponse,
  EnrollStudentRequest,
  TransferStudentRequest,
  ClassStatsResponse
} from '../types/classes';

export const classesService = {
  // Get all classes with pagination
  async getClasses(page: number = 1, limit: number = 10): Promise<ClassListResponse> {
    const response = await apiCall(`/classes?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
    return response;
  },

  // Get class by ID
  async getClassById(id: string): Promise<{ success: boolean; message: string; data: Class }> {
    const response = await apiCall(`/classes/${id}`, {
      method: 'GET',
    });
    return response;
  },

  // Create a new class
  async createClass(data: CreateClassRequest): Promise<{ success: boolean; message: string; data: Class }> {
    const response = await apiCall(`/classes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  },

  // Update a class
  async updateClass(id: string, data: UpdateClassRequest): Promise<{ success: boolean; message: string; data: Class }> {
    const response = await apiCall(`/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  },

  // Delete a class
  async deleteClass(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiCall(`/classes/${id}`, {
      method: 'DELETE',
    });
    return response;
  },

  // Get students in class
  async getStudentsInClass(id: string, page: number = 1, limit: number = 10): Promise<StudentsInClassResponse> {
    const response = await apiCall(`/classes/${id}/students?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
    return response;
  },

  // Enroll a student
  async enrollStudent(classId: string, studentId: string): Promise<{ success: boolean; message: string; data: Class }> {
    const response = await apiCall(`/classes/${classId}/enroll`, {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    });
    return response;
  },

  // Remove a student from class
  async removeStudent(classId: string, studentId: string): Promise<{ success: boolean; message: string; data: Class }> {
    const response = await apiCall(`/classes/${classId}/students/${studentId}`, {
      method: 'DELETE',
    });
    return response;
  },

  // Enroll multiple students
  async enrollMultipleStudents(classId: string, studentIds: string[]): Promise<{ success: boolean; message: string; data: Class }> {
    const response = await apiCall(`/classes/${classId}/enroll-multiple`, {
      method: 'POST',
      body: JSON.stringify({ studentIds }),
    });
    return response;
  },

  // Transfer student between classes
  async transferStudent(data: TransferStudentRequest): Promise<{ success: boolean; message: string }> {
    const response = await apiCall(`/classes/transfer-student`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  },

  // Get class statistics
  async getClassStats(academicYear?: string, departmentId?: string): Promise<ClassStatsResponse> {
    const params = new URLSearchParams();
    if (academicYear) params.append('academicYear', academicYear);
    if (departmentId) params.append('departmentId', departmentId);
    
    const queryString = params.toString();
    const endpoint = `/classes/stats${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiCall(endpoint, {
      method: 'GET',
    });
    return response;
  },
};
```

## React Components

### Classes List Component

Create a component to display all classes with pagination:

```typescript
import React, { useState, useEffect } from 'react';
import { classesService } from '../services/classes.service';
import { Class } from '../types/classes';

const ClassesList: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await classesService.getClasses(page, limit);
      if (response.success) {
        setClasses(response.data.classes);
        setTotal(response.data.total);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [page, limit]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= Math.ceil(total / limit)) {
      setPage(newPage);
    }
  };

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}
      
      <div className="classes-grid">
        {classes.map((cls) => (
          <div key={cls._id} className="class-card">
            <h3>{cls.name}</h3>
            <p>{cls.description}</p>
            <div className="class-details">
              <p>Course: {cls.courseId}</p>
              <p>Teacher: {cls.classTeacherId}</p>
              <p>Credits: {cls.credits}</p>
              <p>Capacity: {cls.currentEnrollment}/{cls.maxCapacity}</p>
              <p>Classroom: {cls.classroom}</p>
            </div>
            <div className="class-actions">
              <button onClick={() => {/* Edit */}}>Edit</button>
              <button onClick={() => {/* Delete */}}>Delete</button>
              <button onClick={() => {/* View Students */}}>
                View Students ({cls.studentIds.length})
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page} of {Math.ceil(total / limit)}</span>
        <button onClick={() => handlePageChange(page + 1)} disabled={page >= Math.ceil(total / limit)}>
          Next
        </button>
      </div>
    </div>
  );
};

export default ClassesList;
```

### Create Class Form Component

Create a form component to create new classes:

```typescript
import React, { useState } from 'react';
import { classesService } from '../services/classes.service';
import { CreateClassRequest } from '../types/classes';

interface CreateClassFormProps {
  onClassCreated: () => void;
}

const CreateClassForm: React.FC<CreateClassFormProps> = ({ onClassCreated }) => {
  const [formData, setFormData] = useState<CreateClassRequest>({
    name: '',
    description: '',
    courseId: '',
    classTeacherId: '',
    studentIds: [],
    organizationId: '',
    schedule: [],
    classroom: '',
    credits: 3,
    maxCapacity: 30,
    currentEnrollment: 0,
    supervisorId: '',
    academicYear: '',
    departmentId: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) newErrors.name = 'Class name is required';
    if (!formData.courseId.trim()) newErrors.courseId = 'Course is required';
    if (!formData.classTeacherId.trim()) newErrors.classTeacherId = 'Class teacher is required';
    if (!formData.academicYear.trim()) newErrors.academicYear = 'Academic year is required';
    if (!formData.organizationId.trim()) newErrors.organizationId = 'Organization is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await classesService.createClass(formData);
        onClassCreated();
        // Reset form
        setFormData({
          name: '',
          description: '',
          courseId: '',
          classTeacherId: '',
          studentIds: [],
          organizationId: '',
          schedule: [],
          classroom: '',
          credits: 3,
          maxCapacity: 30,
          currentEnrollment: 0,
          supervisorId: '',
          academicYear: '',
          departmentId: '',
        });
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to create class');
      }
    }
  };

  const handleScheduleChange = (index: number, field: string, value: string) => {
    const newSchedule = [...formData.schedule];
    if (newSchedule[index]) {
      newSchedule[index] = {
        ...newSchedule[index],
        [field]: value,
      };
    } else {
      newSchedule[index] = {
        dayOfWeek: '',
        startTime: '',
        endTime: '',
        [field]: value,
      };
    }
    setFormData({ ...formData, schedule: newSchedule });
  };

  return (
    <form onSubmit={handleSubmit} className="create-class-form">
      <h2>Create New Class</h2>
      
      <div className="form-group">
        <label>Class Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Course</label>
        <select
          value={formData.courseId}
          onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
          className={errors.courseId ? 'error' : ''}
        >
          <option value="">Select a course</option>
          {/* Course options will be populated from API */}
        </select>
        {errors.courseId && <span className="error-message">{errors.courseId}</span>}
      </div>

      <div className="form-group">
        <label>Class Teacher</label>
        <select
          value={formData.classTeacherId}
          onChange={(e) => setFormData({ ...formData, classTeacherId: e.target.value })}
          className={errors.classTeacherId ? 'error' : ''}
        >
          <option value="">Select a teacher</option>
          {/* Teacher options will be populated from API */}
        </select>
        {errors.classTeacherId && <span className="error-message">{errors.classTeacherId}</span>}
      </div>

      <div className="form-group">
        <label>Academic Year</label>
        <input
          type="text"
          value={formData.academicYear}
          onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
          placeholder="e.g., 2023-2024"
          className={errors.academicYear ? 'error' : ''}
        />
        {errors.academicYear && <span className="error-message">{errors.academicYear}</span>}
      </div>

      <div className="form-group">
        <label>Department</label>
        <select
          value={formData.departmentId}
          onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
        >
          <option value="">Select a department</option>
          {/* Department options will be populated from API */}
        </select>
      </div>

      <div className="form-group">
        <label>Classroom</label>
        <input
          type="text"
          value={formData.classroom}
          onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
          placeholder="e.g., Room 101"
        />
      </div>

      <div className="form-group">
        <label>Credits</label>
        <input
          type="number"
          value={formData.credits}
          onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
        />
      </div>

      <div className="form-group">
        <label>Max Capacity</label>
        <input
          type="number"
          value={formData.maxCapacity}
          onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
        />
      </div>

      <div className="form-group">
        <label>Schedule</label>
        {/* Add schedule fields dynamically */}
      </div>

      <button type="submit">Create Class</button>
    </form>
  );
};

export default CreateClassForm;
```

## State Management

Consider using a state management library like Redux or Context API for managing classes data across components:

```typescript
// src/context/ClassesContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { classesService } from '../services/classes.service';
import { Class } from '../types/classes';

interface ClassesContextType {
  classes: Class[];
  loading: boolean;
  error: string | null;
  fetchClasses: (page?: number, limit?: number) => Promise<void>;
  createClass: (data: any) => Promise<void>;
  updateClass: (id: string, data: any) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
}

const ClassesContext = createContext<ClassesContextType | undefined>(undefined);

export const ClassesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = async (page: number = 1, limit: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await classesService.getClasses(page, limit);
      if (response.success) {
        setClasses(response.data.classes);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const createClass = async (data: any) => {
    try {
      const response = await classesService.createClass(data);
      if (response.success) {
        fetchClasses();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create class');
    }
  };

  const updateClass = async (id: string, data: any) => {
    try {
      const response = await classesService.updateClass(id, data);
      if (response.success) {
        fetchClasses();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update class');
    }
  };

  const deleteClass = async (id: string) => {
    try {
      const response = await classesService.deleteClass(id);
      if (response.success) {
        fetchClasses();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete class');
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <ClassesContext.Provider
      value={{
        classes,
        loading,
        error,
        fetchClasses,
        createClass,
        updateClass,
        deleteClass,
      }}
    >
      {children}
    </ClassesContext.Provider>
  );
};

export const useClasses = () => {
  const context = useContext(ClassesContext);
  if (context === undefined) {
    throw new Error('useClasses must be used within a ClassesProvider');
  }
  return context;
};
```

## Error Handling

Implement comprehensive error handling across your application:

```typescript
// src/components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>Try again</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

## Loading States

Add loading states to improve user experience:

```typescript
// src/components/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium', text }) => {
  const sizeClass = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large',
  };

  return (
    <div className={`loading-spinner ${sizeClass[size]}`}>
      <div className="spinner"></div>
      {text && <p>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
```

## Conclusion

By following this guide, you can create a robust React UI for managing classes in your college management system. The TypeScript interfaces ensure type safety, the service layer handles API communication, and the components provide a clean user interface. Remember to implement proper error handling, loading states, and state management for a complete user experience.
