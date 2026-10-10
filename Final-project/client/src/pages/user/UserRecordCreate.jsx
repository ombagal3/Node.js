import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { recordService } from '../../services/recordService';
import RecordForm from '../../components/forms/RecordForm';
import { getApiErrorMessage } from '../../utils/formatters';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const UserRecordCreate = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    try {
      await recordService.createMyRecord(formData);
      toast.success('Your record has been created successfully.');
      navigate('/user/my-records');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create record'));
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Create Personal Record</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Add an item to your private records catalog
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl glass-panel border border-slate-800">
        <RecordForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          isAdmin={false}
        />
      </div>
    </div>
  );
};

export default UserRecordCreate;
