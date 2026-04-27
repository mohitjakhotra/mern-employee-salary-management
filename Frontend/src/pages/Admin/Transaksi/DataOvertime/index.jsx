import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../../../layout';
import { Breadcrumb, ButtonOne } from '../../../../components';
import { getMe, getDataPegawai } from '../../../../config/redux/action';
import { clearOvertimeFeedback, createDataOvertime, getDataOvertime } from '../../../../config/redux/action/overtimeAction';
import OvertimeEntry from '../../../../components/molecules/OvertimeEntry/OvertimeEntry';

const ITEMS_PER_PAGE = 10;

const DataOvertime = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isError } = useSelector((state) => state.auth);
  const { dataPegawai } = useSelector((state) => state.dataPegawai);
  const { dataOvertime, pagination, loading, message, error, validationErrors } = useSelector((state) => state.overtime);

  const totalPages = useMemo(() => pagination?.pages || Math.ceil((pagination?.total || 0) / ITEMS_PER_PAGE), [pagination]);

  useEffect(() => {
    dispatch(getMe());
    dispatch(getDataPegawai());
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      navigate('/login');
    }
    if (user && user.hak_akses !== 'admin') {
      navigate('/dashboard');
    }
  }, [isError, user, navigate]);

  useEffect(() => {
    dispatch(getDataOvertime({ limit: ITEMS_PER_PAGE, offset: (currentPage - 1) * ITEMS_PER_PAGE }));
  }, [dispatch, currentPage]);

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => dispatch(clearOvertimeFeedback()), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [dispatch, message, error]);

  const handleCreateOvertime = async (payload) => {
    const result = await dispatch(createDataOvertime(payload));
    if (result?.success) {
      dispatch(getDataOvertime({ limit: ITEMS_PER_PAGE, offset: (currentPage - 1) * ITEMS_PER_PAGE }));
    }
    return result;
  };

  return (
    <Layout>
      <Breadcrumb pageName='Data Overtime Pegawai' />

      <div className='mb-6 flex items-center justify-between rounded-sm border border-stroke bg-white px-5 py-4 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5'>
        <div>
          <h2 className='text-title-md2 font-semibold text-black dark:text-white'>Data Overtime</h2>
          <p className='text-sm text-bodydark2'>Kelola penginputan overtime pegawai untuk payroll.</p>
        </div>
        <Link to='/data-pegawai'>
          <ButtonOne>
            <span>Lihat Pegawai</span>
          </ButtonOne>
        </Link>
      </div>

      {message && (
        <div className='mb-4 rounded border border-success bg-success/10 px-4 py-3 text-success'>{message}</div>
      )}
      {error && (
        <div className='mb-4 rounded border border-danger bg-danger/10 px-4 py-3 text-danger'>
          {error}
          {Object.keys(validationErrors || {}).length > 0 && (
            <ul className='mt-2 list-disc pl-5 text-sm'>
              {Object.entries(validationErrors).map(([field, value]) => (
                <li key={field}>{field}: {value}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className='mb-6'>
        <OvertimeEntry
          workers={dataPegawai}
          loading={loading}
          serverErrors={validationErrors}
          onSubmit={handleCreateOvertime}
        />
      </div>

      <div className='rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1'>
        <div className='mb-4 border-b border-stroke pb-3 dark:border-strokedark'>
          <h3 className='font-medium text-black dark:text-white'>Daftar Overtime</h3>
        </div>

        <div className='max-w-full overflow-x-auto py-4'>
          <table className='w-full table-auto'>
            <thead>
              <tr className='bg-gray-2 text-left dark:bg-meta-4'>
                <th className='py-4 px-4 font-medium text-black dark:text-white'>No</th>
                <th className='py-4 px-4 font-medium text-black dark:text-white'>Pegawai</th>
                <th className='py-4 px-4 font-medium text-black dark:text-white'>Tanggal</th>
                <th className='py-4 px-4 font-medium text-black dark:text-white'>Jam</th>
                <th className='py-4 px-4 font-medium text-black dark:text-white'>Alasan</th>
                <th className='py-4 px-4 font-medium text-black dark:text-white'>Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {(dataOvertime || []).map((item, index) => {
                const worker = dataPegawai.find((pegawai) => Number(pegawai.id) === Number(item.worker_id));
                return (
                  <tr key={item.id} className='border-b border-[#eee] dark:border-strokedark'>
                    <td className='py-5 px-4 text-black dark:text-white'>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                    <td className='py-5 px-4 text-black dark:text-white'>
                      {worker ? `${worker.nama_pegawai} (${worker.nik})` : `Pegawai #${item.worker_id}`}
                    </td>
                    <td className='py-5 px-4 text-black dark:text-white'>{String(item.date).slice(0, 10)}</td>
                    <td className='py-5 px-4 text-black dark:text-white'>{item.hours}</td>
                    <td className='py-5 px-4 text-black dark:text-white'>{item.reason}</td>
                    <td className='py-5 px-4 text-black dark:text-white'>{item.createdAt ? String(item.createdAt).slice(0, 19).replace('T', ' ') : '-'}</td>
                  </tr>
                );
              })}
              {(dataOvertime || []).length === 0 && (
                <tr>
                  <td colSpan='6' className='py-8 text-center text-black dark:text-white'>
                    Belum ada data overtime.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className='flex items-center justify-between py-4 text-sm text-bodydark2'>
          <span>
            Halaman {currentPage} dari {Math.max(totalPages, 1)}
          </span>
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              disabled={currentPage === 1}
              className='rounded border border-primary px-4 py-2 font-medium text-primary disabled:cursor-not-allowed disabled:opacity-50'
            >
              Sebelumnya
            </button>
            <button
              type='button'
              onClick={() => setCurrentPage((page) => page + 1)}
              disabled={currentPage >= Math.max(totalPages, 1)}
              className='rounded border border-primary px-4 py-2 font-medium text-primary disabled:cursor-not-allowed disabled:opacity-50'
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DataOvertime;
