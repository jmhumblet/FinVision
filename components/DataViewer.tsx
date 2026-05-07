import React from 'react';

interface DataViewerProps {
  transactions: any[];
  projections: any[];
  debts: any[];
  assets: any[];
  savingsGoals: any[];
  scenarios: any[];
}

const DataTable = ({ title, data }: { title: string, data: any[] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-500">No data available.</p>
      </div>
    );
  }

  const firstDoc = data[0];
  const keys = Object.keys(firstDoc);

  return (
    <div className="mb-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50/50">
            <tr>
              {keys.map(key => (
                <th key={key} className="px-6 py-3 border-b border-slate-200 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {key}
                </th>
              ))}
              <th className="px-6 py-3 border-b border-slate-200 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Extra Information
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, idx) => {
              const extraInfo: any = {};
              const rowKeys = Object.keys(row);
              rowKeys.forEach(k => {
                if (!keys.includes(k)) {
                  extraInfo[k] = row[k];
                }
              });

              return (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  {keys.map(key => {
                    let val = row[key];
                    if (typeof val === 'object' && val !== null) {
                      val = JSON.stringify(val);
                    }
                    return (
                      <td key={key} className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">
                        {String(val)}
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {Object.keys(extraInfo).length > 0 ? (
                      <pre className="text-xs text-slate-500 bg-slate-100 p-2 rounded max-w-xs overflow-x-auto">
                        {JSON.stringify(extraInfo, null, 2)}
                      </pre>
                    ) : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DataViewer: React.FC<DataViewerProps> = (props) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Raw Data Viewer</h2>
        <p className="text-slate-500 mt-2">Inspect your local state and database records.</p>
      </div>
      <DataTable title="Transactions" data={props.transactions} />
      <DataTable title="Projections" data={props.projections} />
      <DataTable title="Debts" data={props.debts} />
      <DataTable title="Assets" data={props.assets} />
      <DataTable title="Savings Goals" data={props.savingsGoals} />
      <DataTable title="Scenarios" data={props.scenarios} />
    </div>
  );
};

export default DataViewer;
