'use client'

import { useMutation, useQuery } from 'convex/react'
import { Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import ImageField from '@/components/manager/ImageField'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { getRenderableSpecifications } from '@/lib/utils'
import { ItemDescriptionDialog } from './item-description-dialog'

type ItemStatus = 'active' | 'draft' | 'archived' | 'preorder'
type SpecificationValue = string | number | boolean

type SpecificationRow = {
  id: string
  key: string
  value: string
}

type DocumentRow = {
  id: string
  name: string
  url: string
}

type ImageDraft = {
  url: string
  storageId?: Id<'_storage'>
}

type ItemFormState = {
  name: string
  sku: string
  status: ItemStatus
  brandId: Id<'brands'> | ''
  categoryId: Id<'categories'> | ''
  inStock: boolean
  price: string
  oldPrice: string
  discountAmount: string
  quantity: string
  collection: string
  labelsText: string
  description: string
  specifications: SpecificationRow[]
  documents: DocumentRow[]
  images: ImageDraft[]
}

interface ItemFormDialogProps {
  isOpen: boolean
  onClose: () => void
  item?: any
  brandsPreload?: any
  categoriesPreload?: any
}

const EMPTY_SELECTION = '__empty__'

function createRowId() {
  return Math.random().toString(36).slice(2, 10)
}

function createEmptySpecificationRow(): SpecificationRow {
  return {
    id: createRowId(),
    key: '',
    value: '',
  }
}

function createEmptyDocumentRow(): DocumentRow {
  return {
    id: createRowId(),
    name: '',
    url: '',
  }
}

function revokeObjectUrls(images: ImageDraft[]) {
  for (const image of images) {
    if (image.url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(image.url)
      } catch {
        // Ignore object URL cleanup errors.
      }
    }
  }
}

function buildInitialImages(item?: any): ImageDraft[] {
  const imageUrls: string[] = Array.isArray(item?.imagesUrl)
    ? item.imagesUrl
    : []
  const imageStorageIds: Id<'_storage'>[] = Array.isArray(item?.imageStorageIds)
    ? item.imageStorageIds
    : []

  return imageUrls.map((url, index) => ({
    url,
    storageId: imageStorageIds[index],
  }))
}

function buildInitialSpecifications(item?: any): SpecificationRow[] {
  return getRenderableSpecifications(item?.specifications).map(
    ([key, value]) => ({
      id: createRowId(),
      key,
      value: String(value),
    }),
  )
}

function buildInitialDocuments(item?: any): DocumentRow[] {
  if (!Array.isArray(item?.documents)) {
    return []
  }

  return item.documents.map((document: { name: string; url: string }) => ({
    id: createRowId(),
    name: document.name ?? '',
    url: document.url ?? '',
  }))
}

function createInitialFormState(item?: any): ItemFormState {
  return {
    name: item?.name ?? '',
    sku: item?.sku ?? '',
    status: item?.status ?? 'active',
    brandId: item?.brandId ?? '',
    categoryId: item?.categoryId ?? '',
    inStock: item?.inStock ?? true,
    price:
      typeof item?.price === 'number' && !Number.isNaN(item.price)
        ? String(item.price)
        : '',
    oldPrice:
      typeof item?.oldPrice === 'number' && !Number.isNaN(item.oldPrice)
        ? String(item.oldPrice)
        : '',
    discountAmount:
      typeof item?.discountAmount === 'number' &&
      !Number.isNaN(item.discountAmount)
        ? String(item.discountAmount)
        : '',
    quantity:
      typeof item?.quantity === 'number' && !Number.isNaN(item.quantity)
        ? String(item.quantity)
        : '',
    collection: item?.collection ?? '',
    labelsText: Array.isArray(item?.labels) ? item.labels.join(', ') : '',
    description: item?.description ?? '',
    specifications: buildInitialSpecifications(item),
    documents: buildInitialDocuments(item),
    images: buildInitialImages(item),
  }
}

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }

  const parsed = Number(trimmed)
  return Number.isNaN(parsed) ? undefined : parsed
}

function parseRequiredNumber(value: string, fieldName: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    throw new Error(`Поле "${fieldName}" обязательно`)
  }

  const parsed = Number(trimmed)
  if (Number.isNaN(parsed)) {
    throw new Error(`Поле "${fieldName}" должно быть числом`)
  }

  return parsed
}

function parseRequiredInteger(value: string, fieldName: string) {
  const parsed = parseRequiredNumber(value, fieldName)
  if (!Number.isInteger(parsed)) {
    throw new Error(`Поле "${fieldName}" должно быть целым числом`)
  }

  return parsed
}

function parseSpecificationValue(value: string): SpecificationValue {
  const trimmed = value.trim()
  if (/^(true|false)$/i.test(trimmed)) {
    return trimmed.toLowerCase() === 'true'
  }
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed)
  }

  return trimmed
}

function buildSpecificationsPayload(rows: SpecificationRow[]) {
  return rows.reduce<Record<string, SpecificationValue>>((acc, row) => {
    const key = row.key.trim()
    const value = row.value.trim()

    if (!key || !value || key.toLowerCase() === 'collection') {
      return acc
    }

    acc[key] = parseSpecificationValue(value)
    return acc
  }, {})
}

function buildDocumentsPayload(rows: DocumentRow[]) {
  return rows
    .map((row) => ({
      name: row.name.trim(),
      url: row.url.trim(),
    }))
    .filter((row) => row.name.length > 0 && row.url.length > 0)
}

function truncateDescription(text: string, max = 220) {
  if (!text) {
    return ''
  }

  return text.length > max ? `${text.slice(0, max)}...` : text
}

export function ItemFormDialog({
  isOpen,
  onClose,
  item,
  brandsPreload: _brandsPreload,
  categoriesPreload: _categoriesPreload,
}: ItemFormDialogProps) {
  const router = useRouter()
  const isEdit = !!item
  const createItem = useMutation(api.manager.create_item)
  const updateItem = useMutation(api.manager.update_item)
  const generateUploadUrl = useMutation(api.manager.generate_upload_url)
  const brands = useQuery(api.manager.list_brands_all)
  const categories = useQuery(api.manager.list_categories_all)

  const brandsList = brands ?? []
  const categoriesList = categories ?? []

  const [isLoading, setIsLoading] = useState(false)
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false)
  const [imagesDirty, setImagesDirty] = useState(false)
  const [formData, setFormData] = useState<ItemFormState>(() =>
    createInitialFormState(item),
  )

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setFormData((current) => {
      revokeObjectUrls(current.images)
      return createInitialFormState(item)
    })
    setImagesDirty(false)
    setIsDescriptionDialogOpen(false)
  }, [isOpen, item])

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      revokeObjectUrls(formData.images)
      setIsDescriptionDialogOpen(false)
      onClose()
    }
  }

  const handleClose = () => {
    revokeObjectUrls(formData.images)
    setIsDescriptionDialogOpen(false)
    onClose()
  }

  const updateSpecification = (
    rowId: string,
    field: 'key' | 'value',
    value: string,
  ) => {
    setFormData((current) => ({
      ...current,
      specifications: current.specifications.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row,
      ),
    }))
  }

  const removeSpecification = (rowId: string) => {
    setFormData((current) => ({
      ...current,
      specifications: current.specifications.filter((row) => row.id !== rowId),
    }))
  }

  const updateDocument = (
    rowId: string,
    field: 'name' | 'url',
    value: string,
  ) => {
    setFormData((current) => ({
      ...current,
      documents: current.documents.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row,
      ),
    }))
  }

  const removeDocument = (rowId: string) => {
    setFormData((current) => ({
      ...current,
      documents: current.documents.filter((row) => row.id !== rowId),
    }))
  }

  const handleImagesChange = (nextImages: ImageDraft[]) => {
    setImagesDirty(true)
    setFormData((current) => ({
      ...current,
      images: nextImages,
    }))
  }

  const handleImagesUpload = async (files: File[]) => {
    try {
      const uploadedImages = await Promise.all(
        files.map(async (file) => {
          const uploadUrl = await generateUploadUrl({})
          const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: { 'Content-Type': file.type },
            body: file,
          })

          if (!response.ok) {
            throw new Error('Не удалось загрузить изображение')
          }

          const json = await response.json()
          return {
            storageId: json.storageId as Id<'_storage'>,
            url: URL.createObjectURL(file),
          }
        }),
      )

      setImagesDirty(true)
      setFormData((current) => ({
        ...current,
        images: [...current.images, ...uploadedImages],
      }))
    } catch (error) {
      console.error(error)
      toast.error('Не удалось загрузить изображения')
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!formData.categoryId) {
      toast.error('Выберите категорию')
      return
    }

    const imageStorageIds = formData.images
      .map((image) => image.storageId)
      .filter(Boolean) as Id<'_storage'>[]

    if (imagesDirty && imageStorageIds.length !== formData.images.length) {
      toast.error(
        'У некоторых изображений нет storageId. Удалите их и загрузите заново, чтобы сохранить медиаданные.',
      )
      return
    }

    let price: number
    let quantity: number

    try {
      price = parseRequiredNumber(formData.price, 'Цена')
      quantity = parseRequiredInteger(formData.quantity, 'Количество')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Проверьте числовые поля',
      )
      return
    }

    const oldPrice = parseOptionalNumber(formData.oldPrice)
    const discountAmount = parseOptionalNumber(formData.discountAmount)
    const collection = formData.collection.trim()
    const labels = formData.labelsText
      .split(',')
      .map((label) => label.trim())
      .filter(Boolean)
    const specifications = buildSpecificationsPayload(formData.specifications)
    const documents = buildDocumentsPayload(formData.documents)

    setIsLoading(true)

    try {
      if (isEdit) {
        await updateItem({
          id: item._id,
          name: formData.name.trim(),
          sku: formData.sku.trim(),
          description: formData.description,
          brandId: formData.brandId ? (formData.brandId as Id<'brands'>) : null,
          categoryId: formData.categoryId as Id<'categories'>,
          status: formData.status,
          inStock: formData.inStock,
          price,
          quantity,
          oldPrice: oldPrice ?? null,
          discountAmount: discountAmount ?? null,
          collection: collection || null,
          labels: labels.length > 0 ? labels : null,
          documents: documents.length > 0 ? documents : null,
          specifications:
            Object.keys(specifications).length > 0 ? specifications : null,
          ...(imagesDirty ? { imageStorageIds } : {}),
        })
        toast.success('Товар обновлен')
      } else {
        await createItem({
          name: formData.name.trim(),
          sku: formData.sku.trim(),
          description: formData.description,
          categoryId: formData.categoryId as Id<'categories'>,
          status: formData.status,
          inStock: formData.inStock,
          price,
          quantity,
          ...(formData.brandId
            ? { brandId: formData.brandId as Id<'brands'> }
            : {}),
          ...(oldPrice !== undefined ? { oldPrice } : {}),
          ...(discountAmount !== undefined ? { discountAmount } : {}),
          ...(collection ? { collection } : {}),
          ...(labels.length > 0 ? { labels } : {}),
          ...(documents.length > 0 ? { documents } : {}),
          ...(Object.keys(specifications).length > 0 ? { specifications } : {}),
          ...(imageStorageIds.length > 0 ? { imageStorageIds } : {}),
        })
        toast.success('Товар создан')
      }

      router.refresh()
      handleClose()
    } catch (error) {
      console.error(error)
      const message =
        error instanceof Error && error.message
          ? error.message
          : isEdit
            ? 'Не удалось обновить товар'
            : 'Не удалось создать товар'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className='max-w-[calc(100vw-2rem)] overflow-hidden p-0 sm:max-w-5xl'>
          <div className='flex max-h-[90vh] flex-col'>
            <DialogHeader className='border-b px-6 py-4 pr-14'>
              <DialogTitle>
                {isEdit ? 'Редактирование товара' : 'Добавление товара'}
              </DialogTitle>
              <DialogDescription>
                Основные поля редактируются здесь. Описание открывается в
                отдельном окне, чтобы диалог не расползался по высоте.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleSubmit}
              className='flex min-h-0 flex-1 flex-col'
            >
              <div className='flex-1 space-y-6 overflow-y-auto px-6 py-5'>
                <section className='space-y-4 rounded-lg border p-4'>
                  <div>
                    <h3 className='font-semibold text-gray-900'>Основное</h3>
                    <p className='text-sm text-gray-500'>
                      Базовые атрибуты товара и привязка к каталогу.
                    </p>
                  </div>

                  <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                    <div className='space-y-2 md:col-span-2 xl:col-span-3'>
                      <Label htmlFor='item-name'>Название</Label>
                      <Input
                        id='item-name'
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((current) => ({
                            ...current,
                            name: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='item-sku'>SKU</Label>
                      <Input
                        id='item-sku'
                        value={formData.sku}
                        onChange={(e) =>
                          setFormData((current) => ({
                            ...current,
                            sku: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label>Статус</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: ItemStatus) =>
                          setFormData((current) => ({
                            ...current,
                            status: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Выберите статус' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='active'>Активен</SelectItem>
                          <SelectItem value='draft'>Черновик</SelectItem>
                          <SelectItem value='preorder'>Предзаказ</SelectItem>
                          <SelectItem value='archived'>Архив</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-2'>
                      <Label>Бренд</Label>
                      <Select
                        value={formData.brandId || EMPTY_SELECTION}
                        onValueChange={(value) =>
                          setFormData((current) => ({
                            ...current,
                            brandId:
                              value === EMPTY_SELECTION
                                ? ''
                                : (value as Id<'brands'>),
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Выберите бренд' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={EMPTY_SELECTION}>
                            Не выбрано
                          </SelectItem>
                          {brandsList.map((brand: any) => (
                            <SelectItem key={brand._id} value={brand._id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-2'>
                      <Label>Категория</Label>
                      <Select
                        value={formData.categoryId || EMPTY_SELECTION}
                        onValueChange={(value) =>
                          setFormData((current) => ({
                            ...current,
                            categoryId:
                              value === EMPTY_SELECTION
                                ? ''
                                : (value as Id<'categories'>),
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Выберите категорию' />
                        </SelectTrigger>
                        <SelectContent className='max-h-72'>
                          <SelectItem value={EMPTY_SELECTION}>
                            Не выбрано
                          </SelectItem>
                          {categoriesList.map((category: any) => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='item-collection'>Коллекция</Label>
                      <Input
                        id='item-collection'
                        value={formData.collection}
                        onChange={(e) =>
                          setFormData((current) => ({
                            ...current,
                            collection: e.target.value,
                          }))
                        }
                        placeholder='Одинаковое значение связывает похожие товары'
                      />
                    </div>

                    <div className='flex items-center justify-between rounded-lg border px-3 py-2 xl:col-span-3'>
                      <div>
                        <Label htmlFor='item-in-stock'>В наличии</Label>
                        <p className='text-sm text-gray-500'>
                          Выключите, если товар нельзя купить прямо сейчас.
                        </p>
                      </div>
                      <Switch
                        id='item-in-stock'
                        checked={formData.inStock}
                        onCheckedChange={(checked) =>
                          setFormData((current) => ({
                            ...current,
                            inStock: checked,
                          }))
                        }
                      />
                    </div>
                  </div>
                </section>

                <section className='space-y-4 rounded-lg border p-4'>
                  <div>
                    <h3 className='font-semibold text-gray-900'>
                      Цена и склад
                    </h3>
                    <p className='text-sm text-gray-500'>
                      Основная цена, старая цена, скидка и остаток.
                    </p>
                  </div>

                  <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='item-price'>Цена</Label>
                      <Input
                        id='item-price'
                        type='number'
                        value={formData.price}
                        onChange={(e) =>
                          setFormData((current) => ({
                            ...current,
                            price: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='item-old-price'>Старая цена</Label>
                      <Input
                        id='item-old-price'
                        type='number'
                        value={formData.oldPrice}
                        onChange={(e) =>
                          setFormData((current) => ({
                            ...current,
                            oldPrice: e.target.value,
                          }))
                        }
                        placeholder='Необязательно'
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='item-discount'>Скидка %</Label>
                      <Input
                        id='item-discount'
                        type='number'
                        value={formData.discountAmount}
                        onChange={(e) =>
                          setFormData((current) => ({
                            ...current,
                            discountAmount: e.target.value,
                          }))
                        }
                        placeholder='Необязательно'
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='item-quantity'>Количество</Label>
                      <Input
                        id='item-quantity'
                        type='number'
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData((current) => ({
                            ...current,
                            quantity: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>
                </section>

                <section className='space-y-4 rounded-lg border p-4'>
                  <div className='flex items-start justify-between gap-4'>
                    <div>
                      <h3 className='font-semibold text-gray-900'>Описание</h3>
                      <p className='text-sm text-gray-500'>
                        Редактируется в отдельном окне, чтобы не занимать весь
                        диалог.
                      </p>
                    </div>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => setIsDescriptionDialogOpen(true)}
                    >
                      {formData.description
                        ? 'Редактировать описание'
                        : 'Добавить описание'}
                    </Button>
                  </div>

                  <div className='rounded-lg border bg-gray-50/60 p-4 text-sm text-gray-700'>
                    {formData.description ? (
                      <div className='whitespace-pre-wrap'>
                        {truncateDescription(formData.description)}
                      </div>
                    ) : (
                      <span className='text-gray-400'>
                        Описание пока не заполнено
                      </span>
                    )}
                  </div>
                </section>

                <section className='space-y-4 rounded-lg border p-4'>
                  <div className='flex items-start justify-between gap-4'>
                    <div>
                      <h3 className='font-semibold text-gray-900'>
                        Характеристики
                      </h3>
                      <p className='text-sm text-gray-500'>
                        collection управляется отдельным полем и здесь
                        игнорируется.
                      </p>
                    </div>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        setFormData((current) => ({
                          ...current,
                          specifications: [
                            ...current.specifications,
                            createEmptySpecificationRow(),
                          ],
                        }))
                      }
                    >
                      <Plus />
                      Добавить
                    </Button>
                  </div>

                  {formData.specifications.length === 0 ? (
                    <div className='rounded-lg border border-dashed p-4 text-sm text-gray-500'>
                      Характеристики не добавлены.
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      {formData.specifications.map((row) => (
                        <div
                          key={row.id}
                          className='grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]'
                        >
                          <Input
                            value={row.key}
                            onChange={(e) =>
                              updateSpecification(row.id, 'key', e.target.value)
                            }
                            placeholder='Ключ'
                          />
                          <Input
                            value={row.value}
                            onChange={(e) =>
                              updateSpecification(
                                row.id,
                                'value',
                                e.target.value,
                              )
                            }
                            placeholder='Значение'
                          />
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            onClick={() => removeSpecification(row.id)}
                            aria-label='Удалить характеристику'
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className='space-y-4 rounded-lg border p-4'>
                  <div>
                    <h3 className='font-semibold text-gray-900'>Метки</h3>
                    <p className='text-sm text-gray-500'>
                      Введите метки через запятую.
                    </p>
                  </div>

                  <Input
                    value={formData.labelsText}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        labelsText: e.target.value,
                      }))
                    }
                    placeholder='Например: hit, eco, new'
                  />
                </section>

                <section className='space-y-4 rounded-lg border p-4'>
                  <div className='flex items-start justify-between gap-4'>
                    <div>
                      <h3 className='font-semibold text-gray-900'>Документы</h3>
                      <p className='text-sm text-gray-500'>
                        Название и публичная ссылка на документ.
                      </p>
                    </div>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        setFormData((current) => ({
                          ...current,
                          documents: [
                            ...current.documents,
                            createEmptyDocumentRow(),
                          ],
                        }))
                      }
                    >
                      <Plus />
                      Добавить
                    </Button>
                  </div>

                  {formData.documents.length === 0 ? (
                    <div className='rounded-lg border border-dashed p-4 text-sm text-gray-500'>
                      Документы не добавлены.
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      {formData.documents.map((row) => (
                        <div
                          key={row.id}
                          className='grid gap-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto]'
                        >
                          <Input
                            value={row.name}
                            onChange={(e) =>
                              updateDocument(row.id, 'name', e.target.value)
                            }
                            placeholder='Название документа'
                          />
                          <Input
                            value={row.url}
                            onChange={(e) =>
                              updateDocument(row.id, 'url', e.target.value)
                            }
                            placeholder='https://...'
                          />
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            onClick={() => removeDocument(row.id)}
                            aria-label='Удалить документ'
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className='space-y-4 rounded-lg border p-4'>
                  <div>
                    <h3 className='font-semibold text-gray-900'>Изображения</h3>
                    <p className='text-sm text-gray-500'>
                      Порядок изображений сохраняется. Максимум 15 файлов.
                    </p>
                  </div>

                  <ImageField
                    itemName={formData.name || 'Товар'}
                    images={formData.images}
                    max={15}
                    onDropFilesAction={handleImagesUpload}
                    onChangeAction={handleImagesChange}
                  />
                </section>
              </div>

              <DialogFooter className='border-t bg-white px-6 py-4'>
                <Button type='button' variant='outline' onClick={handleClose}>
                  Отмена
                </Button>
                <Button type='submit' disabled={isLoading}>
                  {isLoading
                    ? 'Сохранение...'
                    : isEdit
                      ? 'Сохранить изменения'
                      : 'Создать товар'}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <ItemDescriptionDialog
        open={isDescriptionDialogOpen}
        onOpenChange={setIsDescriptionDialogOpen}
        value={formData.description}
        onSave={(value) =>
          setFormData((current) => ({
            ...current,
            description: value,
          }))
        }
      />
    </>
  )
}
