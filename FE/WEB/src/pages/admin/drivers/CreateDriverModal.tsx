import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import DatePicker from "@/components/common/DatePicker"
import ResultDialog from "@/components/common/ResultDialog"
import { createDriver } from "@/services/driver.service"
import { uploadImage } from "@/services/upload.service"
import { format, parseISO } from "date-fns"
import { useEffect, useRef, useState, type RefObject } from "react"
import { ArrowLeft, Trash, Upload, UserPlus, X } from "lucide-react"
import { getErrorData, getLocalizedErrorMessage } from "@/utils/errorDictionary"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const STEPS = [
    { title: "Thông tin cá nhân", description: "Thông tin cơ bản của tài xế." },
    { title: "Phương tiện", description: "Phương tiện vận chuyển và giấy tờ tùy thân." },
    { title: "Tài khoản ngân hàng", description: "Nơi nhận thanh toán của tài xế." }
]

const INITIAL_FORM = {
    fullname: "",
    email: "",
    birthday: "",
    address: "",
    phone: "",
    citizenId: "",
    driverLicenseId: "",
    vehicleModel: "",
    vehicleRegistrationId: "",
    licensePlate: "",
    bankName: "",
    accountNumber: "",
    accountHolder: ""
}

const INITIAL_ERRORS: Record<keyof typeof INITIAL_FORM, string> = {
    fullname: "",
    email: "",
    birthday: "",
    address: "",
    phone: "",
    citizenId: "",
    driverLicenseId: "",
    vehicleModel: "",
    vehicleRegistrationId: "",
    licensePlate: "",
    bankName: "",
    accountNumber: "",
    accountHolder: ""
}

function CreateDriverModal({ open, onOpenChange }: Props) {
    const [form, setForm] = useState(INITIAL_FORM)
    const [errors, setErrors] = useState(INITIAL_ERRORS)
    const [step, setStep] = useState(0)
    const [result, setResult] = useState({ isOpen: false, isSuccess: true, message: "" })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [citizenFront, setCitizenFront] = useState<File | null>(null)
    const [citizenBack, setCitizenBack] = useState<File | null>(null)
    const [citizenFrontPreview, setCitizenFrontPreview] = useState("")
    const [citizenBackPreview, setCitizenBackPreview] = useState("")
    const citizenFrontRef = useRef<HTMLInputElement>(null)
    const citizenBackRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        return () => {
            if (citizenFrontPreview) URL.revokeObjectURL(citizenFrontPreview)
            if (citizenBackPreview) URL.revokeObjectURL(citizenBackPreview)
        }
    }, [citizenFrontPreview, citizenBackPreview])

    const showResult = (success: boolean, message: string) => {
        setResult({ isOpen: true, isSuccess: success, message })
    }

    const updateField = (field: keyof typeof INITIAL_FORM, value: string) => {
        setForm((current) => ({ ...current, [field]: value }))
        setErrors((current) => ({ ...current, [field]: "" }))
    }

    const handleClearImage = (side: "front" | "back") => {
        if (side === "front") {
            setCitizenFront(null)
            setCitizenFrontPreview("")
            if (citizenFrontRef.current) citizenFrontRef.current.value = ""
            return
        }

        setCitizenBack(null)
        setCitizenBackPreview("")
        if (citizenBackRef.current) citizenBackRef.current.value = ""
    }

    const handleClear = () => {
        setForm(INITIAL_FORM)
        setErrors(INITIAL_ERRORS)
        setStep(0)
        setCitizenFront(null)
        setCitizenBack(null)
        setCitizenFrontPreview("")
        setCitizenBackPreview("")
        if (citizenFrontRef.current) citizenFrontRef.current.value = ""
        if (citizenBackRef.current) citizenBackRef.current.value = ""
        onOpenChange(false)
    }

    const validateStep = () => {
        if (step === 0) {
            const nextErrors: Record<keyof typeof INITIAL_FORM, string> = { ...INITIAL_ERRORS }

            if (!form.fullname.trim()) nextErrors.fullname = "Vui lòng nhập họ tên"
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = "Email không đúng định dạng"
            if (!form.phone.trim()) nextErrors.phone = "Vui lòng nhập số điện thoại"
            else if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(form.phone.trim())) nextErrors.phone = "Số điện thoại không đúng định dạng"
            if (!form.birthday) nextErrors.birthday = "Vui lòng chọn ngày sinh"
            if (!form.address.trim()) nextErrors.address = "Vui lòng nhập địa chỉ"

            setErrors(nextErrors)

            return !Object.values(nextErrors).some((error) => error)
        }

        if (step === 1) {
            const nextErrors: Record<keyof typeof INITIAL_FORM, string> = { ...INITIAL_ERRORS }

            if (!form.vehicleModel.trim()) nextErrors.vehicleModel = "Vui lòng nhập loại phương tiện"
            if (!form.licensePlate.trim()) nextErrors.licensePlate = "Vui lòng nhập biển số xe"
            if (!form.driverLicenseId.trim()) nextErrors.driverLicenseId = "Vui lòng nhập số giấy phép lái xe"
            if (!form.vehicleRegistrationId.trim()) nextErrors.vehicleRegistrationId = "Vui lòng nhập số đăng ký xe"
            if (!/^\d{12}$/.test(form.citizenId.trim())) nextErrors.citizenId = "Số căn cước phải gồm đúng 12 chữ số"

            setErrors(nextErrors)

            return !Object.values(nextErrors).some((error) => error)
        }

        const nextErrors: Record<keyof typeof INITIAL_FORM, string> = { ...INITIAL_ERRORS }

        if (!form.bankName.trim()) nextErrors.bankName = "Vui lòng nhập tên ngân hàng"
        if (!form.accountNumber.trim()) nextErrors.accountNumber = "Vui lòng nhập số tài khoản"
        if (!form.accountHolder.trim()) nextErrors.accountHolder = "Vui lòng nhập chủ tài khoản"

        setErrors(nextErrors)

        return !Object.values(nextErrors).some((error) => error)
    }

    const handleNextStep = () => {
        if (!validateStep()) return
        setStep((current) => current + 1)
    }

    const handleSubmit = async (event: any) => {
        event.preventDefault()

        if (!validateStep()) return

        setIsSubmitting(true)
        try {
            const [frontImage, backImage] = await Promise.all([
                citizenFront ? uploadImage(citizenFront) : undefined,
                citizenBack ? uploadImage(citizenBack) : undefined
            ])

            await createDriver({
                fullname: form.fullname.trim(),
                email: form.email.trim(),
                birthday: form.birthday,
                address: form.address.trim(),
                phone: form.phone.trim(),
                citizenId: form.citizenId.trim(),
                citizenImages: {
                    front: frontImage ?? "",
                    back: backImage ?? ""
                },
                driverLicenseId: form.driverLicenseId.trim(),
                vehicleModel: form.vehicleModel.trim(),
                vehicleRegistrationId: form.vehicleRegistrationId.trim(),
                licensePlate: form.licensePlate.trim(),
                bankAccount: {
                    bankName: form.bankName.trim(),
                    accountNumber: form.accountNumber.trim(),
                    accountHolder: form.accountHolder.trim()
                }
            })

            handleClear()
            showResult(true, "Tài xế đã được tạo thành công. Thông tin đăng nhập đã được gửi qua email.")
        }
        catch (error) {
            const response = getErrorData(error)
            showResult(false, getLocalizedErrorMessage(response))
        }
        finally {
            setIsSubmitting(false)
        }
    }

    const renderImageField = (
        side: "front" | "back",
        label: string,
        file: File | null,
        preview: string,
        inputRef: RefObject<HTMLInputElement | null>
    ) => (
        <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{label}</p>

            {preview ? (
                <div className="flex h-16 items-center gap-2 rounded-xl border border-border-default bg-background p-2">
                    <img src={preview} alt={label} className="size-10 shrink-0 rounded-lg object-cover" />
                    <span className="min-w-0 flex-1 truncate text-xs text-foreground">{file?.name}</span>

                    <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Xóa ${label.toLowerCase()}`}
                        onClick={() => handleClearImage(side)}
                    >
                        <Trash className="size-4" />
                    </Button>
                </div>
            ) : (
                <Label className="flex h-16 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border-strong bg-background px-3 transition-colors hover:border-primary-hover hover:bg-brand-primary-soft">
                    <Input
                        type="file"
                        ref={inputRef}
                        accept="image/*"
                        onChange={(event) => {
                            const selected = event.target.files?.[0]
                            if (!selected) return

                            if (side === "front") {
                                setCitizenFront(selected)
                                setCitizenFrontPreview(URL.createObjectURL(selected))
                                return
                            }

                            setCitizenBack(selected)
                            setCitizenBackPreview(URL.createObjectURL(selected))
                        }}
                        className="sr-only"
                    />

                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary-soft text-brand-primary-strong">
                        <Upload className="size-4" />
                    </span>

                    <span className="min-w-0">
                        <span className="block text-xs font-medium text-foreground">Chọn ảnh</span>
                        <span className="block text-[11px] text-muted-foreground">Nhấn để chọn từ thiết bị</span>
                    </span>
                </Label>
            )}
        </div>
    )

    return (
        <>
            <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
                <DialogPrimitive.Portal>
                    <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ease-out data-starting-style:opacity-0 data-ending-style:opacity-0" />
                    <DialogPrimitive.Viewport className="fixed inset-0 z-50 grid place-items-center overflow-y-auto overflow-x-hidden p-4">
                        <DialogPrimitive.Popup className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border-default bg-card shadow-xl outline-none transition-[opacity,translate,scale] duration-200 ease-out motion-reduce:transition-none data-starting-style:translate-y-3 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:translate-y-3 data-ending-style:scale-95 data-ending-style:opacity-0">
                            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                                <div className="flex items-center justify-between gap-4 border-b border-border-default px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary-strong">
                                            <UserPlus className="size-4.5" />
                                        </span>

                                        <div className="space-y-0.5">
                                            <DialogPrimitive.Title className="text-base font-semibold text-foreground">
                                                Tạo tài xế mới
                                            </DialogPrimitive.Title>

                                            <DialogPrimitive.Description className="text-xs text-muted-foreground">
                                                {STEPS[step].description}
                                            </DialogPrimitive.Description>
                                        </div>
                                    </div>

                                    <DialogPrimitive.Close
                                        aria-label="Đóng"
                                        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                                    >
                                        <X className="size-4" />
                                    </DialogPrimitive.Close>
                                </div>

                                <div className="space-y-4 px-6 pt-4 pb-6">
                                    {step === 0 && (
                                        <>
                                            <div className="space-y-1">
                                                <Label className="flex-col items-start gap-2 text-sm font-medium text-foreground">
                                                    Họ và tên
                                                    <Input
                                                        type="text"
                                                        value={form.fullname}
                                                        onChange={(event) => updateField("fullname", event.target.value)}
                                                        placeholder="Ví dụ: Trần Minh Khoa"
                                                        aria-invalid={Boolean(errors.fullname)}
                                                        className="h-10 px-3"
                                                    />
                                                </Label>

                                                <div className="h-4">
                                                    {errors.fullname && (
                                                        <FieldError className="text-xs leading-4">{errors.fullname}</FieldError>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div className="space-y-1">
                                                    <Label className="flex-col items-start gap-2 text-sm font-medium text-foreground">
                                                        Email
                                                        <Input
                                                            type="email"
                                                            value={form.email}
                                                            onChange={(event) => updateField("email", event.target.value)}
                                                            placeholder="email@example.com"
                                                            aria-invalid={Boolean(errors.email)}
                                                            className="h-10 px-3"
                                                        />
                                                    </Label>

                                                    <div className="h-4">
                                                        {errors.email && (
                                                            <FieldError className="text-xs leading-4">{errors.email}</FieldError>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <Label className="flex-col items-start gap-2 text-sm font-medium text-foreground">
                                                        Số điện thoại
                                                        <Input
                                                            type="tel"
                                                            value={form.phone}
                                                            onChange={(event) => updateField("phone", event.target.value)}
                                                            placeholder="0912345678"
                                                            aria-invalid={Boolean(errors.phone)}
                                                            className="h-10 px-3"
                                                        />
                                                    </Label>

                                                    <div className="h-4">
                                                        {errors.phone && (
                                                            <FieldError className="text-xs leading-4">{errors.phone}</FieldError>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <Label className="flex-col items-start gap-2 text-sm font-medium text-foreground">
                                                        Ngày sinh
                                                        <DatePicker
                                                            value={form.birthday ? parseISO(form.birthday) : undefined}
                                                            onChange={(date) => {
                                                                updateField("birthday", date ? format(date, "yyyy-MM-dd") : "")
                                                            }}
                                                            placeholder="Chọn ngày sinh"
                                                            className="h-10"
                                                            selectionMode="field"
                                                            maxYear={new Date().getFullYear()}
                                                            minYear={new Date().getFullYear() - 100}
                                                        />
                                                    </Label>

                                                    <div className="h-4">
                                                        {errors.birthday && (
                                                            <FieldError className="text-xs leading-4">{errors.birthday}</FieldError>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <Label className="flex-col items-start gap-2 text-sm font-medium text-foreground">
                                                        Địa chỉ
                                                        <Input
                                                            type="text"
                                                            value={form.address}
                                                            onChange={(event) => updateField("address", event.target.value)}
                                                            placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                                                            aria-invalid={Boolean(errors.address)}
                                                            className="h-10 px-3"
                                                        />
                                                    </Label>

                                                    <div className="h-4">
                                                        {errors.address && (
                                                            <FieldError className="text-xs leading-4">{errors.address}</FieldError>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 1 && (
                                        <>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div className="space-y-1">
                                                    <Label className="flex-col items-start gap-2 text-sm font-medium text-foreground">
                                                        Loại phương tiện
                                                        <Input
                                                            type="text"
                                                            value={form.vehicleModel}
                                                            onChange={(event) => updateField("vehicleModel", event.target.value)}
                                                            placeholder="Ví dụ: Wave Alpha 2025"
                                                            aria-invalid={Boolean(errors.vehicleModel)}
                                                            className="h-10 px-3"
                                                        />
                                                    </Label>

                                                    <div className="h-4">
                                                        {errors.vehicleModel && (
                                                            <FieldError className="text-xs leading-4">{errors.vehicleModel}</FieldError>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <Label className="flex-col items-start gap-2 text-sm font-medium text-foreground">
                                                        Biển số xe
                                                        <Input
                                                            type="text"
                                                            value={form.licensePlate}
                                                            onChange={(event) => updateField("licensePlate", event.target.value)}
                                                            placeholder="Ví dụ: 59A16456"
                                                            aria-invalid={Boolean(errors.licensePlate)}
                                                            className="h-10 px-3"
                                                        />
                                                    </Label>

                                                    <div className="h-4">
                                                        {errors.licensePlate && (
                                                            <FieldError className="text-xs leading-4">{errors.licensePlate}</FieldError>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <Label className="flex-col items-start gap-2 text-sm font-medium text-foreground">
                                                        Số giấy phép lái xe
                                                        <Input
                                                            type="text"
                                                            value={form.driverLicenseId}
                                                            onChange={(event) => updateField("driverLicenseId", event.target.value)}
                                                            placeholder="Ví dụ: DL123656790"
                                                            aria-invalid={Boolean(errors.driverLicenseId)}
                                                            className="h-10 px-3"
                                                        />
                                                    </Label>

                                                    <div className="h-4">
                                                        {errors.driverLicenseId && (
                                                            <FieldError className="text-xs leading-4">{errors.driverLicenseId}</FieldError>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <Label className="flex-col items-start gap-2 text-sm font-medium text-foreground">
                                                        Số đăng ký xe
                                                        <Input
                                                            type="text"
                                                            value={form.vehicleRegistrationId}
                                                            onChange={(event) => updateField("vehicleRegistrationId", event.target.value)}
                                                            placeholder="Ví dụ: VR133456790"
                                                            aria-invalid={Boolean(errors.vehicleRegistrationId)}
                                                            className="h-10 px-3"
                                                        />
                                                    </Label>

                                                    <div className="h-4">
                                                        {errors.vehicleRegistrationId && (
                                                            <FieldError className="text-xs leading-4">{errors.vehicleRegistrationId}</FieldError>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="flex-col items-start gap-2 text-sm font-medium text-foreground">
                                                    Số căn cước
                                                    <Input
                                                        type="text"
                                                        inputMode="numeric"
                                                        maxLength={12}
                                                        value={form.citizenId}
                                                        onChange={(event) => updateField("citizenId", event.target.value.replace(/\D/g, ""))}
                                                        placeholder="12 chữ số"
                                                        aria-invalid={Boolean(errors.citizenId)}
                                                        className="h-10 px-3"
                                                    />
                                                </Label>

                                                <div className="h-4">
                                                    {errors.citizenId && (
                                                        <FieldError className="text-xs leading-4">{errors.citizenId}</FieldError>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-foreground">Giấy tờ tùy thân</p>

                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    {renderImageField("front", "Mặt trước", citizenFront, citizenFrontPreview, citizenFrontRef)}
                                                    {renderImageField("back", "Mặt sau", citizenBack, citizenBackPreview, citizenBackRef)}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 2 && (
                                        <>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div className="space-y-1">
                                                    <Label className="flex-col items-start gap-2 text-sm font-medium text-foreground">
                                                        Ngân hàng
                                                        <Input
                                                            type="text"
                                                            value={form.bankName}
                                                            onChange={(event) => updateField("bankName", event.target.value)}
                                                            placeholder="Ví dụ: Techcombank"
                                                            aria-invalid={Boolean(errors.bankName)}
                                                            className="h-10 px-3"
                                                        />
                                                    </Label>

                                                    <div className="h-4">
                                                        {errors.bankName && (
                                                            <FieldError className="text-xs leading-4">{errors.bankName}</FieldError>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <Label className="flex-col items-start gap-2 text-sm font-medium text-foreground">
                                                        Số tài khoản
                                                        <Input
                                                            type="text"
                                                            inputMode="numeric"
                                                            value={form.accountNumber}
                                                            onChange={(event) => updateField("accountNumber", event.target.value)}
                                                            placeholder="Ví dụ: 19031234567890"
                                                            aria-invalid={Boolean(errors.accountNumber)}
                                                            className="h-10 px-3"
                                                        />
                                                    </Label>

                                                    <div className="h-4">
                                                        {errors.accountNumber && (
                                                            <FieldError className="text-xs leading-4">{errors.accountNumber}</FieldError>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-1 sm:col-span-2">
                                                    <Label className="flex-col items-start gap-2 text-sm font-medium text-foreground">
                                                        Chủ tài khoản
                                                        <Input
                                                            type="text"
                                                            value={form.accountHolder}
                                                            onChange={(event) => updateField("accountHolder", event.target.value)}
                                                            placeholder="Ví dụ: TRAN MINH KHOA"
                                                            aria-invalid={Boolean(errors.accountHolder)}
                                                            className="h-10 px-3"
                                                        />
                                                    </Label>

                                                    <div className="h-4">
                                                        {errors.accountHolder && (
                                                            <FieldError className="text-xs leading-4">{errors.accountHolder}</FieldError>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex flex-col-reverse gap-2 border-t border-border-default bg-muted/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex shrink-0 items-center gap-2">
                                        {step > 0 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => setStep((current) => current - 1)}
                                                className="h-10 rounded-xl px-3 text-muted-foreground hover:text-foreground"
                                            >
                                                <ArrowLeft className="size-4" />
                                                Quay lại
                                            </Button>
                                        )}
                                    </div>

                                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleClear}
                                            className="h-10 rounded-xl"
                                        >
                                            Hủy
                                        </Button>

                                        {step < STEPS.length - 1 && (
                                            <Button
                                                type="button"
                                                onClick={handleNextStep}
                                                className="h-10 rounded-xl"
                                            >
                                                Tiếp tục
                                            </Button>
                                        )}

                                        {step === STEPS.length - 1 && (
                                            <Button
                                                type="submit"
                                                loading={isSubmitting}
                                                className="h-10 rounded-xl"
                                            >
                                                Tạo tài xế
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </DialogPrimitive.Popup>
                    </DialogPrimitive.Viewport>
                </DialogPrimitive.Portal>
            </DialogPrimitive.Root>

            <ResultDialog
                open={result.isOpen}
                onOpenChange={(isOpen) => setResult((current) => ({ ...current, isOpen }))}
                isSuccess={result.isSuccess}
                message={result.message}
            />
        </>
    )
}

export default CreateDriverModal
