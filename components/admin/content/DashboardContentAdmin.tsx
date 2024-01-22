"use client"

import AdminHistoryTable from "../dashboard/AdminHistoryTable"
import AdminChartDevice from "../dashboard/AdminChartDevice";
import AdminChartHistory from "../dashboard/AdminChartHistory";

const DashboardContentAdmin = () => {
  return (
    <div className="py-4">
      <div className="flex flex-wrap -mx-4">
        <div className="w-full md:w-2/3 px-4 mb-8">
          <AdminChartHistory />
        </div>
        <div className="w-full md:w-1/3 px-4 mb-8">
          <AdminChartDevice />
        </div>
      </div>

      <div className="rounded-lg bg-white p-6">
        <div className="flex items-center space-x-3">
          <div className="rounded w-4 h-8 bg-slate-900"></div>
          <p className="font-semibold">Lịch sử hoạt động</p>
        </div>
        <AdminHistoryTable />
      </div>
    </div>
  )
}


export default DashboardContentAdmin