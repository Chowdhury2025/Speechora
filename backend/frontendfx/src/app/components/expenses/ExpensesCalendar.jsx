import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, XCircle } from "lucide-react";
import { API_URL } from "../../../config";
import { useRecoilValue } from "recoil";
import { userStates } from "../../../atoms";

const ExpensesCalendar = ({ selectedStore, selectedUser }) => {
  const userState = useRecoilValue(userStates);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [expenseData, setExpenseData] = useState([]);
  const [calendarSummary, setCalendarSummary] = useState([]);
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [monthTotals, setMonthTotals] = useState({
    totalAmount: 0
  });
  const [selectedDay, setSelectedDay] = useState(null);

  // Get expenses for a specific day
  const getExpensesForDay = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return expenseData.filter(expense => 
      format(new Date(expense.date), "yyyy-MM-dd") === dateStr
    );
  };

  // Build days for current month
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  useEffect(() => {
    if (!isCalendarExpanded) return;

    const fetchExpenses = async () => {
      setIsLoading(true);
      setError("");
      try {        const month = format(currentMonth, "M");
        const year = format(currentMonth, "yyyy");
        let url = `${API_URL}/api/expv1/expenses/calendar?month=${month}&year=${year}`;

        // If user is STAFF or STOREMANAGER, force their store ID
        if (['STAFF', 'STOREMANAGER'].includes(userState.role)) {
          url += `&userStoreId=${userState.storeIds[0]}&role=${userState.role}`;
        } else if (selectedStore !== "All") {
          url += `&storeName=${selectedStore}`;
        }
        if (selectedUser !== "All") {
          url += `&userId=${selectedUser}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch expense data");
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || "Failed to load expense data");
        }

        // Group expenses by date
        const byDate = {};
        let totalAmount = 0;

        data.expenses.forEach(expense => {
          const date = format(new Date(expense.date), "yyyy-MM-dd");
          if (!byDate[date]) {
            byDate[date] = {
              date,
              totalAmount: 0,
              expenses: []
            };
          }
          byDate[date].totalAmount += expense.amount;
          byDate[date].expenses.push(expense);
          totalAmount += expense.amount;
        });

        setCalendarSummary(Object.values(byDate));
        setExpenseData(data.expenses);
        setMonthTotals({
          totalAmount
        });
      } catch (error) {
        console.error("Error fetching expenses:", error);
        setError(error.message || "Failed to load expenses");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, [currentMonth, selectedStore, selectedUser, isCalendarExpanded]);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  // Get summary data for a specific day
  const getSummaryFor = day => {
    const key = format(day, "yyyy-MM-dd");
    return calendarSummary.find(c => c.date === key);
  };

  return (
    <div className="mt-8 relative bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Header and toggle button */}
      <div 
        className="p-4 bg-gray-700 flex justify-between items-center cursor-pointer"
        onClick={() => setIsCalendarExpanded(prev => !prev)}
      >
        <h2 className="text-lg font-medium text-gray-100 flex items-center gap-2">
          Expense Calendar
          {isCalendarExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </h2>
        <div className="text-gray-300 text-sm">
          Total Month Expenses: <span className="font-semibold text-yellow-400">K{monthTotals.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Calendar content */}
      {isCalendarExpanded && (
        <div className="p-4">
          {isLoading ? (
            <div className="text-center text-gray-400 py-4">Loading expenses...</div>
          ) : error ? (
            <div className="text-center text-red-400 py-4">{error}</div>
          ) : (
            <>
              {/* Calendar navigation */}
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <ChevronLeft className="text-gray-400" />
                </button>
                <h3 className="text-xl font-semibold text-gray-100">
                  {format(currentMonth, "MMMM yyyy")}
                </h3>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <ChevronRight className="text-gray-400" />
                </button>
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {daysInMonth.map(day => {
                  const summary = getSummaryFor(day);
                  return (                    <div
                      key={day.toISOString()}
                      className={`relative p-2 border border-gray-700 rounded min-h-[80px] cursor-pointer 
                        ${summary ? 'hover:bg-gray-700' : 'hover:bg-gray-700/50'} transition-colors
                        ${format(day, "yyyy-MM-dd") === format(selectedDay || new Date(), "yyyy-MM-dd") ? 'bg-gray-700' : ''}`}
                      onClick={() => summary && setSelectedDay(day)}
                    >
                      <div className="text-sm text-gray-400">{format(day, "d")}</div>
                      {summary && (
                        <div className="mt-1">
                          <div className="text-yellow-400 font-medium text-sm">
                            K{summary.totalAmount.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {summary.expenses.length} expense{summary.expenses.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Detailed expense list for selected date (optional) */}
              {/* Expense Details Modal */}
              {selectedDay && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold text-white">
                        Expenses for {format(selectedDay, "MMMM d, yyyy")}
                      </h3>
                      <button
                        onClick={() => setSelectedDay(null)}
                        className="text-gray-400 hover:text-white"
                      >
                        <XCircle size={24} />
                      </button>
                    </div>

                    <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                      <table className="min-w-full divide-y divide-gray-700">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Time</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Description</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Category</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Store</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Payment Method</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Notes</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {getExpensesForDay(selectedDay).map(expense => (
                            <tr key={expense.id} className="hover:bg-gray-700">
                              <td className="px-4 py-2 text-sm text-gray-300">
                                {format(new Date(expense.date), "h:mm a")}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-300">{expense.description}</td>
                              <td className="px-4 py-2 text-sm text-gray-300">{expense.category}</td>
                              <td className="px-4 py-2 text-sm text-gray-300">
                                {expense.store?.name || "N/A"}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-300">{expense.paymentMethod}</td>
                              <td className="px-4 py-2 text-sm text-gray-300">
                                {expense.notes || "No notes"}
                              </td>
                              <td className="px-4 py-2 text-sm font-medium text-yellow-400">
                                K{expense.amount.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-700">
                          <tr>
                            <td colSpan="6" className="px-4 py-2 text-sm font-semibold text-white text-right">
                              Total for {format(selectedDay, "MMM d")}:
                            </td>
                            <td className="px-4 py-2 text-sm font-semibold text-yellow-400">
                              K{getExpensesForDay(selectedDay).reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpensesCalendar;
