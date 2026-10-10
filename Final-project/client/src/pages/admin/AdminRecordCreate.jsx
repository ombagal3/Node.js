import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { recordService } from '../../services/recordService';
import { userService } from '../../services/userService';
import RecordForm from '../../components/forms/RecordForm';
import { getApiErrorMessage } from '../../utils/formatters';
import { ArrowLeft, FilePlus } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminRecordCreate = () => {
  const navigate = useNavigate();
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userService.getAllUsers({ limit: 100, status: 'active' });
        if (res.success) {
          setAvailableUsers(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch users for assignment:', err);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    try {
      await recordService.adminCreateRecord(formData);
      toast.success('Record created and published according to visibility settings.');
      navigate('/admin/records');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create record'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center space-x-3">
        <Link
          to="/admin/records"
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Create System Record</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Add a new organizational entry with custom visibility and assignment scope
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl glass-panel border border-slate-800">
        <RecordForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          isAdmin={true}
          availableUsers={availableUsers}
        />
      </div>
    </div>
  );
};

export default AdminRecordCreate;
