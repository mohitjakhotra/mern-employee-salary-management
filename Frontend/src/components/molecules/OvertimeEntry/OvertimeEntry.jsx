import { useEffect, useMemo, useState } from 'react';
import ButtonOne from '../../atoms/Buttons/ButtonOne';
import { validateOvertimeInput } from '../../../utils/overtimeValidation';
import { buildOvertimePayload } from './payload';
import './OvertimeEntry.css';

const initialForm = {
  worker_id: '',
  date: '',
  hours: '',
  reason: ''
};

const OvertimeEntry = ({ workers = [], loading = false, serverErrors = {}, onSubmit }) => {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (Object.keys(serverErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...serverErrors }));
    }
  }, [serverErrors]);

  const isSubmitDisabled = useMemo(() => {
    return loading;
  }, [loading]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateOvertimeInput(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const payload = buildOvertimePayload(formData);

    const result = await onSubmit(payload);
    if (result?.success) {
      setFormData(initialForm);
      setErrors({});
    }
  };

  return (
    <form onSubmit={handleSubmit} className='rounded-sm border border-stroke bg-white px-5 pt-6 pb-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5'>
      <div className='mb-6'>
        <h3 className='text-title-md2 font-semibold text-black dark:text-white'>Input Overtime</h3>
        <p className='text-sm text-bodydark2'>Isi data overtime pegawai dan submit untuk proses payroll.</p>
      </div>

      <div className='overtime-entry-grid'>
        <div>
          <label className='mb-2.5 block text-black dark:text-white'>Pegawai</label>
          <select
            name='worker_id'
            value={formData.worker_id}
            onChange={handleChange}
            className='w-full rounded border border-stroke bg-transparent py-3 px-4 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input'
          >
            <option value=''>Pilih Pegawai</option>
            {workers.map((worker) => (
              <option key={worker.id} value={worker.id}>
                {worker.nama_pegawai} ({worker.nik})
              </option>
            ))}
          </select>
          {errors.worker_id && <p className='mt-1 text-sm text-danger'>{errors.worker_id}</p>}
        </div>

        <div>
          <label className='mb-2.5 block text-black dark:text-white'>Tanggal</label>
          <input
            type='date'
            name='date'
            value={formData.date}
            onChange={handleChange}
            className='w-full rounded border border-stroke bg-transparent py-3 px-4 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input'
          />
          {errors.date && <p className='mt-1 text-sm text-danger'>{errors.date}</p>}
        </div>

        <div>
          <label className='mb-2.5 block text-black dark:text-white'>Jam Overtime</label>
          <input
            type='number'
            min='1'
            max='6'
            step='0.5'
            name='hours'
            value={formData.hours}
            onChange={handleChange}
            placeholder='Contoh: 2.5'
            className='w-full rounded border border-stroke bg-transparent py-3 px-4 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input'
          />
          {errors.hours && <p className='mt-1 text-sm text-danger'>{errors.hours}</p>}
        </div>

        <div>
          <label className='mb-2.5 block text-black dark:text-white'>Alasan</label>
          <textarea
            name='reason'
            value={formData.reason}
            onChange={handleChange}
            rows={4}
            placeholder='Minimal 10 karakter'
            className='w-full rounded border border-stroke bg-transparent py-3 px-4 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input'
          />
          {errors.reason && <p className='mt-1 text-sm text-danger'>{errors.reason}</p>}
        </div>
      </div>

      <div className='mt-6'>
        <ButtonOne type='submit' disabled={isSubmitDisabled}>
          <span>{loading ? 'Menyimpan...' : 'Simpan Overtime'}</span>
        </ButtonOne>
      </div>
    </form>
  );
};

export default OvertimeEntry;
