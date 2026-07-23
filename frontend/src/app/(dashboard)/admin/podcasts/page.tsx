export default function AdminPodcasts() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">مدیریت پادکستها</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">لیست پادکستها</h2>
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            پادکست جدید
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-right p-2">عنوان</th>
                <th className="text-right p-2">مدت زمان</th>
                <th className="text-right p-2">وضعیت</th>
                <th className="text-right p-2">عملیات</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2">اپیزود ۱ - معرفی</td>
                <td className="p-2">۲۵:۳۰</td>
                <td className="p-2">منتشر شده</td>
                <td className="p-2">
                  <button className="text-blue-500 hover:text-blue-700 ml-2">ویرایش</button>
                  <button className="text-red-500 hover:text-red-700">حذف</button>
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-2">اپیزود ۲ - تکنولوژی</td>
                <td className="p-2">۳۲:۱۵</td>
                <td className="p-2">منتشر شده</td>
                <td className="p-2">
                  <button className="text-blue-500 hover:text-blue-700 ml-2">ویرایش</button>
                  <button className="text-red-500 hover:text-red-700">حذف</button>
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-2">اپیزود ۳ - هوش مصنوعی</td>
                <td className="p-2">۲۸:۴۵</td>
                <td className="p-2">پیشنویس</td>
                <td className="p-2">
                  <button className="text-blue-500 hover:text-blue-700 ml-2">ویرایش</button>
                  <button className="text-red-500 hover:text-red-700">حذف</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}