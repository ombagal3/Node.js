import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import UserForm from '../../components/forms/UserForm';
import { getApiErrorMessage } from '../../utils/formatters';
import { ArrowLeft, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUserCreate = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    try {
      await userService.createUser(formData);
      toast.success('User account created successfully in directory.');
      navigate('/admin/users');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create user'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center space-x-3">
        <Link
          to="/admin/users"
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Create User Account</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Register a new system user with administrator-assigned permissions
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl glass-panel border border-slate-800">
        <UserForm onSubmit={handleSubmit} isLoading={isLoading} isEdit={false} />
      </div>
    </div>
  );
};

export default AdminUserCreate;
