import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { recordService } from '../../services/recordService';
import RecordForm from '../../components/forms/RecordForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import { getApiErrorMessage } from '../../utils/formatters';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const UserRecordEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecord = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await recordService.getMyRecordById(id);
        if (res.success) {
          setRecord(res.data.record);
        }
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to retrieve record'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecord();
  }, [id]);

  const handleSubmit = async (formData) => {
    setIsUpdating(true);
    try {
      await recordService.updateMyRecord(id, formData);
      toast.success('Your record has been updated.');
      navigate('/user/my-records');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update record'));
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading record data..." />;
  }

  if (error || !record) {
    return <ErrorState message={error || 'Record not found'} onRetry={() => navigate('/user/my-records')} />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center space-x-3">
        <Link
          to="/user/my-records"
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Edit Personal Record</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Update your personal documentation item
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl glass-panel border border-slate-800">
        <RecordForm
          initialValues={record}
          onSubmit={handleSubmit}
          isEdit={true}
          isLoading={isUpdating}
          isAdmin={false}
        />
      </div>
    </div>
  );
};

export default UserRecordEdit;
