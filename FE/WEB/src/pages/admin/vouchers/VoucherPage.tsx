import DataTable from "@/components/data-table/DataTable"
import Filter from "@/components/data-table/Filter"
import Pagination from "@/components/data-table/Pagination"
import Search from "@/components/data-table/Search"
// import LoadingOverlay from "@/components/LoadingOverlay"
import { Button } from "@/components/ui/button"
import { Plus, Ticket } from "lucide-react"

function VoucherPage() {

    return (
        <div className="space-y-6">
            <div>
                <div>
                    <h2>Mã giảm giá</h2>
                    <p>
                        Mã giảm giá của hệ thống và quán ăn
                    </p>
                </div>

                <Button>
                    <Plus />
                    Thêm mã khuyến mãi
                </Button>
            </div>

            <div>
                <div>
                    <Search
                        value={""}
                        onChange={() => { }}
                        placeholder="Tìm theo tên hoặc code..."
                        onSearch={() => { }}
                    />
                </div>

                <Filter
                    values={{ null: "" }}
                    groups={[]}
                    onApply={() => { }}
                />
            </div>

            <section>
                <DataTable
                    headers={[]}
                    rows={[]}
                    emptyMessage={"Không có mã khuyến mãi nào"}
                    emptyDescription={"Thử tìm kiếm với từ khóa khác hoặc tạo mã khuyễn mãi mới"}
                    emptyIcon={Ticket}
                />

                <Pagination
                    currentPage={1}
                    totalPages={50}
                    totalItems={10}
                    pageSize={10}
                    onPageChange={() => { }}
                    onPageSizeChange={() => { }}
                />
            </section>


            {/* <LoadingOverlay message="Đang tải mã khuyến mãi" scope="content" /> */}
        </div>
    )
}

export default VoucherPage