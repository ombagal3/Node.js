import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { recordService } from '../../services/recordService';
import { userService } from '../../services/userService';
import RecordForm from '../../components/forms/RecordForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import { getApiErrorMessage } from '../../utils/formatters';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminRecordEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [recRes, usersRes] = await Promise.all([
          recordService.adminGetRecordById(id),
          userService.getAllUsers({ limit: 100 }),
        ]);

        if (recRes.success) {
          setRecord(recRes.data.record);
        }
        if (usersRes.success) {
          setAvailableUsers(usersRes.data);
        }
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load record details'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (formData) => {
    setIsUpdating(true);
    try {
      await recordService.adminUpdateRecord(id, formData);
      toast.success('Record modified and saved.');
      navigate('/admin/records');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update record'));
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Fetching record metadata..." />;
  }

  if (error || !record) {
    return <ErrorState message={error || 'Record not found'} onRetry={() => navigate('/admin/records')} />;
  }

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
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Edit System Record</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Modify details, status, priority, or user assignments
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl glass-panel border border-slate-800">
        <RecordForm
          initialValues={record}
          onSubmit={handleSubmit}
          isEdit={true}
          isLoading={isUpdating}
          isAdmin={true}
          availableUsers={availableUsers}
        />
      </div>
    </div>
  );
};

export default AdminRecordEdit;
