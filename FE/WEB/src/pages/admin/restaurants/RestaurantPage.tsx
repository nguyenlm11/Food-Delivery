import DataTable from "@/components/data-table/DataTable"
import Pagination from "@/components/data-table/Pagination"
import { Store } from "lucide-react"

function RestaurantPage() {
    return (
        <div>
            <div>
                <div>
                    <h2>Quán ăn</h2>
                    <p>
                        Chưa nghĩ ra
                    </p>
                </div>
            </div>

            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
                <DataTable
                    headers={[]}
                    rows={[]}
                    isLoading={true}
                    skeletonRows={10}
                    emptyMessage=""
                    emptyDescription=""
                    emptyIcon={Store}
                />

                <Pagination
                    currentPage={1}
                    totalPages={10}
                    totalItems={10}
                    pageSize={10}
                    onPageChange={() => { }}
                    onPageSizeChange={() => { }}
                />
            </section>
        </div>
    )
}

export default RestaurantPage
