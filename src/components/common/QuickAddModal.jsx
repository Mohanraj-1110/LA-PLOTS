import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';
import { ROUTES } from '../../routes/routePaths';
import {
  MapPin,
  UserPlus,
  CalendarPlus,
  BadgePercent,
  FileUp,
} from 'lucide-react';

export function QuickAddModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Add New Plot',
      description: 'Register a plot parcel with area & rate calculations',
      icon: MapPin,
      color: 'bg-emerald-500 text-white',
      hover: 'hover:bg-emerald-50 hover:border-emerald-200',
      path: ROUTES.ADD_PLOT,
    },
    {
      title: 'Add New Customer / Lead',
      description: 'Onboard buyer, record budget & pipeline stage',
      icon: UserPlus,
      color: 'bg-blue-500 text-white',
      hover: 'hover:bg-blue-50 hover:border-blue-200',
      path: ROUTES.ADD_CUSTOMER,
    },
    {
      title: 'Schedule Appointment',
      description: 'Book site visit, office negotiation, or registration',
      icon: CalendarPlus,
      color: 'bg-amber-500 text-white',
      hover: 'hover:bg-amber-50 hover:border-amber-200',
      path: ROUTES.ADD_APPOINTMENT,
    },
    {
      title: 'Record Sale Transaction',
      description: 'Log sale amount, acquisition cost & profit margins',
      icon: BadgePercent,
      color: 'bg-purple-500 text-white',
      hover: 'hover:bg-purple-50 hover:border-purple-200',
      path: ROUTES.SALES,
    },
    {
      title: 'Upload Document',
      description: 'Upload title deeds, layout plans, or buyer KYC',
      icon: FileUp,
      color: 'bg-teal-500 text-white',
      hover: 'hover:bg-teal-50 hover:border-teal-200',
      path: ROUTES.DOCUMENTS,
    },
  ];

  const handleSelect = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Real Estate Actions"
      subtitle="Select an action to launch fast workflow"
      maxWidth="md"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.title}
              type="button"
              onClick={() => handleSelect(act.path)}
              className={`flex items-start gap-3.5 p-3.5 rounded-2xl border border-slate-200/80 bg-white text-left transition-all duration-150 cursor-pointer ${act.hover}`}
            >
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${act.color} shadow-xs`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 leading-tight mb-0.5">
                  {act.title}
                </h4>
                <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                  {act.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

QuickAddModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
