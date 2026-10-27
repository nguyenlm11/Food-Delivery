import { Search as SearchIcon } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { ButtonGroup } from "../ui/button-group"

interface SearchProps {
    value: string
    onChange: (value: string) => void
    onSearch: () => void
    placeholder?: string
}

function Search({ value, onChange, onSearch, placeholder = "Tìm kiếm..." }: SearchProps) {
    return (
        <form
            className="flex w-full items-center gap-2"
            onSubmit={(event) => {
                event.preventDefault()
                onSearch()
            }}
        >
            <ButtonGroup className="w-full flex-1">
                <Input
                    className="w-full min-w-0 flex-1"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                />
                <Button type="submit" className="shrink-0">
                    <SearchIcon className="size-4" />
                    Tìm kiếm
                </Button>
            </ButtonGroup>
        </form>
    )
}

export default Search
