import { useState, useEffect } from 'react';
import Layout from '../../../../layout';
import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumb, ButtonOne } from '../../../../components';
import { FaRegEdit, FaPlus } from 'react-icons/fa';
import { BsTrash3 } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { deleteDataPegawai, getDataPegawai, getMe } from '../../../../config/redux/action';
import { BiSearch } from 'react-icons/bi';
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight, MdOutlineKeyboardArrowDown } from 'react-icons/md';
import { exportToCsv } from '../../../../utils/exportCsv';
import { HiDownload } from 'react-icons/hi';

const ITEMS_PER_PAGE = 4;

const CSV_COLUMNS = [
    { label: 'NIK', key: 'nik' },
    { label: 'Nama Pegawai', key: 'nama_pegawai' },
    { label: 'Jenis Kelamin', key: 'jenis_kelamin' },
    { label: 'Designation', key: 'jabatan' },
    { label: 'Tanggal Masuk', key: 'tanggal_masuk' },
    { label: 'Status', key: 'status' },
    { label: 'Hak Akses', key: 'hak_akses' },
];


const DataPegawai = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isError, user } = useSelector((state) => state.auth);
    const { dataPegawai } = useSelector((state) => state.dataPegawai);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const filteredDataPegawai = dataPegawai.filter((pegawai) => {
        const { nama_pegawai, status } = pegawai;
        const keyword = searchKeyword.toLowerCase();
        const statusKeyword = filterStatus.toLowerCase();
        return (
            nama_pegawai.toLowerCase().includes(keyword) &&
            (filterStatus === '' || status.toLowerCase() === statusKeyword)
        );
    });

    const totalPages = Math.ceil(filteredDataPegawai.length / ITEMS_PER_PAGE);

    const handleExportCsv = () => {
        exportToCsv(filteredDataPegawai, CSV_COLUMNS, 'data-pegawai');
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handleSearch = (event) => {
        setSearchKeyword(event.target.value);
        setCurrentPage(1);
    };

    const handleFilterStatus = (event) => {
        setFilterStatus(event.target.value);
        setCurrentPage(1);
    };

    const onDeletePegawai = (id) => {
        Swal.fire({
            title: 'Konfirmasi',
            text: 'Apakah Anda yakin ingin Menghapus?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya',
            cancelButtonText: 'Tidak',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(deleteDataPegawai(id)).then(() => {
                    Swal.fire({
                        title: 'Berhasil',
                        text: 'Data pegawai berhasil dihapus.',
                        icon: 'success',
                        timer: 1000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                    dispatch(getDataPegawai());
                });
            }
        });
    };

    useEffect(() => {
        dispatch(getDataPegawai(startIndex, endIndex));
    }, [dispatch, startIndex, endIndex]);

    useEffect(() => {
        dispatch(getMe());
    }, [dispatch]);

    useEffect(() => {
        if (isError) {
            navigate('/login');
        }
        if (user && user.hak_akses !== 'admin') {
            navigate('/dashboard');
        }
    }, [isError, user, navigate]);

    const paginationItems = () => {
        const items = [];
        const maxVisiblePages = 5;

        const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        for (let page = startPage; page <= endPage; page++) {
            items.push(
                <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`py-2 px-4 border border-gray-2 text-black font-semibold dark:text-white dark:border-strokedark ${currentPage === page ? 'bg-primary text-white hover:bg-primary dark:bg-primary dark:hover:bg-primary' : 'hover:bg-gray-2 dark:hover:bg-stroke'
                        } rounded-lg`}
                >
                    {page}
                </button>
            );
        }

        if (startPage > 2) {
            items.unshift(
                <p
                    key="start-ellipsis"
                    className="py-2 px-4 border border-gray-2 dark:bg-transparent text-black font-medium bg-gray dark:border-strokedark dark:text-white"
                >
                    ...
                </p>
            );
        }

        if (endPage < totalPages - 1) {
            items.push(
                <p
                    key="end-ellipsis"
                    className="py-2 px-4 border border-gray-2 dark:bg-transparent text-black font-medium bg-gray dark:border-strokedark dark:text-white"
                >
                    ...
                </p>
            );
        }

        return items;
    };

    return (
        <Layout>
            <Breadcrumb pageName="Data Pegawai" />
            <div className="flex items-center gap-3 mt-4">
                <Link to="/data-pegawai/form-data-pegawai/add">
                    <ButtonOne>
                        <span>Tambah Pegawai</span>
                        <span><FaPlus /></span>
                    </ButtonOne>
                </Link>

                <button
                    onClick={handleExportCsv}
                    disabled={filteredDataPegawai.length === 0}
                    className="inline-flex items-center gap-2 rounded bg-success py-2 px-6 text-white font-medium hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <HiDownload className="text-lg" />
                    <span>Export CSV</span>
                </button>
            </div>

            <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1 mt-6">
                <div className="flex justify-between items-center mt-4 flex-col md:flex-row md:justify-between">
                    <div className="relative flex-1 md:mr-2 mb-4 md:mb-0">
                        <div className="relative">
                            <span className="absolute top-1/2 left-48 z-30 -translate-y-1/2 text-xl">
                                <MdOutlineKeyboardArrowDown />
                            </span>
                            <select
                                value={filterStatus}
                                onChange={handleFilterStatus}
                                className="relative appearance-none rounded border border-stroke bg-transparent py-3 px-8 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                            >
                                <option value="">Status</option>
                                <option value="Karyawan Tetap">Karyawan Tetap</option>
                                <option value="Karyawan Tidak Tetap">Karyawan Tidak Tetap</option>
                            </select>
                        </div>
                    </div>
                    <div className="relative flex-2 mb-4 md:mb-0">
                        <input
                            type="text"
                            placeholder="Cari Nama Pegawai..."
                            value={searchKeyword}
                            onChange={handleSearch}
                            className="rounded-lg border-[1.5px] border-stroke bg-transparent py-2 pl-10 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary left-0"
                        />
                        <span className="absolute left-2 py-3 text-xl">
                            <BiSearch />
                        </span>
                    </div>
                </div>

                {/* Mobile card view */}
                <div className="md:hidden space-y-3 py-4">
                    {filteredDataPegawai.slice(startIndex, endIndex).map((data, index) => (
                        <div key={data.id} className="rounded-lg border border-stroke bg-white dark:bg-boxdark dark:border-strokedark p-4 flex flex-col gap-3">
                            {/* Top row: avatar + name + actions */}
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 h-11 w-11 rounded-full overflow-hidden bg-gray-2">
                                    <img
                                        src={`http://localhost:5000/images/${data.photo}`}
                                        alt={`Foto ${data.nama_pegawai}`}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-black dark:text-white truncate">{data.nama_pegawai}</p>
                                    <p className="text-sm text-body dark:text-bodydark">{data.jabatan}</p>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <Link to={`/data-pegawai/form-data-pegawai/edit/${data.id}`} aria-label="Edit pegawai">
                                        <FaRegEdit className="text-primary text-lg" />
                                    </Link>
                                    <button onClick={() => onDeletePegawai(data.id)} aria-label="Hapus pegawai">
                                        <BsTrash3 className="text-danger text-lg" />
                                    </button>
                                </div>
                            </div>

                            {/* Detail grid — all remaining fields */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-2 border-t border-stroke dark:border-strokedark text-sm">
                                <div>
                                    <span className="text-body dark:text-bodydark text-xs uppercase tracking-wide">NIK</span>
                                    <p className="text-black dark:text-white font-medium">{data.nik}</p>
                                </div>
                                <div>
                                    <span className="text-body dark:text-bodydark text-xs uppercase tracking-wide">Jenis Kelamin</span>
                                    <p className="text-black dark:text-white font-medium">{data.jenis_kelamin}</p>
                                </div>
                                <div>
                                    <span className="text-body dark:text-bodydark text-xs uppercase tracking-wide">Tanggal Masuk</span>
                                    <p className="text-black dark:text-white font-medium">{data.tanggal_masuk}</p>
                                </div>
                                <div>
                                    <span className="text-body dark:text-bodydark text-xs uppercase tracking-wide">Hak Akses</span>
                                    <p className="text-black dark:text-white font-medium">{data.hak_akses}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium
                ${data.status === 'Karyawan Tetap'
                                            ? 'bg-success bg-opacity-10 text-success'
                                            : 'bg-warning bg-opacity-10 text-warning'}`}>
                                        {data.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Desktop table view  */}
                <div className="hidden md:block max-w-full overflow-x-auto py-4">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="bg-gray-2 text-left dark:bg-meta-4">
                                <th className="py-4 px-4 font-medium text-black dark:text-white xl:pl-11">No</th>
                                <th className="py-4 px-4 font-medium text-black dark:text-white xl:pl-11">Photo</th>
                                <th className="py-4 px-4 font-medium text-black dark:text-white xl:pl-11">NIK</th>
                                <th className="py-4 px-4 font-medium text-black dark:text-white">Nama Pegawai</th>
                                <th className="py-4 px-4 font-medium text-black dark:text-white">Jenis Kelamin</th>
                                <th className="py-4 px-4 font-medium text-black dark:text-white">Designation</th>
                                <th className="py-4 px-4 font-medium text-black dark:text-white">Tanggal Masuk</th>
                                <th className="py-4 px-4 font-medium text-black dark:text-white">Status</th>
                                <th className="py-4 px-4 font-medium text-black dark:text-white">Hak Akses</th>
                                <th className="py-4 px-4 font-medium text-black dark:text-white">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDataPegawai.slice(startIndex, endIndex).map((data, index) => {
                                return (
                                    <tr key={data.id}>
                                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                            <p className="text-black dark:text-white text-center">{startIndex + index + 1}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                                            <div className="h-12.5 w-15">
                                                <div className="rounded-full overflow-hidden">
                                                    <img src={`http://localhost:5000/images/${data.photo}`} alt="Photo Profil" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                            <p className="text-black dark:text-white text-center">{data.nik}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                            <p className="text-black dark:text-white">{data.nama_pegawai}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                            <p className="text-black dark:text-white">{data.jenis_kelamin}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                            <p className="text-black dark:text-white">{data.jabatan}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                            <p className="text-black dark:text-white">{data.tanggal_masuk}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                            <p className="text-black dark:text-white">{data.status}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                            <p className="text-black dark:text-white">{data.hak_akses}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                            <div className="flex items-center space-x-3.5">
                                                <Link
                                                    to={`/data-pegawai/form-data-pegawai/edit/${data.id}`}
                                                    className="hover:text-black">
                                                    <FaRegEdit className="text-primary text-xl hover:text-black dark:hover:text-white" />
                                                </Link>
                                                <button
                                                    onClick={() => onDeletePegawai(data.id)}
                                                    className="hover:text-black">
                                                    <BsTrash3 className="text-danger text-xl hover:text-black dark:hover:text-white" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center mt-4 flex-col md:flex-row md:justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-gray-5 dark:text-gray-4 text-sm py-4">
                            Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredDataPegawai.length)} dari {filteredDataPegawai.length} Data Pegawai
                        </span>
                    </div>
                    <div className="flex space-x-2 py-4">
                        <button
                            disabled={currentPage === 1}
                            onClick={goToPrevPage}
                            className="py-2 px-6 rounded-lg border border-primary text-primary font-semibold hover:bg-primary hover:text-white dark:text-white dark:border-primary dark:hover:bg-primary dark:hover:text-white disabled:opacity-50"
                        >
                            < MdKeyboardDoubleArrowLeft />
                        </button>
                        {paginationItems()}
                        <button
                            disabled={currentPage === totalPages}
                            onClick={goToNextPage}
                            className="py-2 px-6 rounded-lg border border-primary text-primary font-semibold hover:bg-primary hover:text-white dark:text-white dark:border-primary dark:hover:bg-primary dark:hover:text-white disabled:opacity-50"
                        >
                            < MdKeyboardDoubleArrowRight />
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default DataPegawai;
