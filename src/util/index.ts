import type { MoneyAmount, Product, ProductVariant, Region } from '@medusajs/medusa'
export type ProductVariantInfo = Pick<ProductVariant, "prices">
export type RegionInfo = Pick<Region, "currency_code" | "tax_code" | "tax_rate">

export type ProductPreviewType = {
  id: string
  title: string
  handle: string | null
  thumbnail: string | null
  price?: {
    calculated_price?: string
    original_price?: string
    difference?: string
    price_type?: "default" | "sale"
  }
}

export type CalculatedVariant = ProductVariant & {
  calculated_price: number
  calculated_price_type: "sale" | "default"
  original_price: number
}

export const isObject = (input: unknown) => input instanceof Object
export const isArray = (input: unknown) => Array.isArray(input)
export const isEmpty = (input: unknown) => {
  return (
    input === null ||
    input === undefined ||
    (isObject(input) && Object.keys(input).length === 0) ||
    (isArray(input) && (input as unknown[]).length === 0) ||
    (typeof input === "string" && input.trim().length === 0)
  )
}

const getPercentageDiff = (original: number, calculated: number) => {
  const diff = original - calculated
  const decrease = (diff / original) * 100

  return decrease.toFixed()
}

export const findCheapestRegionPrice = (variants: ProductVariant[], regionId: string) => {
  const regionPrices = variants.reduce((acc, v) => {
    const price = v.prices.find((p) => p.region_id === regionId)
    if (price) {
      acc.push(price)
    }

    return acc
  }, [] as MoneyAmount[])

  if (!regionPrices.length) {
    return undefined
  }

  //find the price with the lowest amount in regionPrices
  const cheapestPrice = regionPrices.reduce((acc, p) => {
    if (acc.amount > p.amount) {
      return p
    }

    return acc
  })

  return cheapestPrice
}

export const findCheapestCurrencyPrice = (
  variants: ProductVariant[],
  currencyCode: string
) => {
  const currencyPrices = variants.reduce((acc, v) => {
    const price = v.prices.find((p) => p.currency_code === currencyCode)
    if (price) {
      acc.push(price)
    }

    return acc
  }, [] as MoneyAmount[])

  if (!currencyPrices.length) {
    return undefined
  }

  //find the price with the lowest amount in currencyPrices
  const cheapestPrice = currencyPrices.reduce((acc, p) => {
    if (acc.amount > p.amount) {
      return p
    }

    return acc
  })

  return cheapestPrice
}

export const findCheapestPrice = (variants: ProductVariant[], region: Region) => {
  const { id, currency_code } = region
  
  let cheapestPrice = findCheapestRegionPrice(variants, id)

      if (!cheapestPrice) {
        cheapestPrice = findCheapestCurrencyPrice(
          variants,
          currency_code
        )
      }

      if (cheapestPrice) {
        return formatAmount({
          amount: cheapestPrice.amount,
          region: region,
        })
      }

      // if we can't find any price that matches the current region,
      // either by id or currency, then the product is not available in
      // the current region
      return "Not available in your region"
}

export const transformProductPreview = (
  product: Product,
  region: Region
): ProductPreviewType => {
  const cheapestPrice = findCheapestPrice(product.variants, region);

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    thumbnail: product.thumbnail,
    price: { original_price: cheapestPrice },
  }
}

type FormatVariantPriceParams = {
  variant: ProductVariantInfo
  region: RegionInfo
  includeTaxes?: boolean
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

/**
 * Takes a product variant and a region, and converts the variant's price to a localized decimal format
 */
export const formatVariantPrice = ({
  variant,
  region,
  includeTaxes = true,
  ...rest
}: FormatVariantPriceParams) => {
  const amount = computeVariantPrice({ variant, region, includeTaxes })

  return convertToLocale({
    amount,
    currency_code: region?.currency_code,
    ...rest,
  })
}

type ComputeVariantPriceParams = {
  variant: ProductVariantInfo
  region: RegionInfo
  includeTaxes?: boolean
}

/**
 * Takes a product variant and region, and returns the variant price as a decimal number
 * @param params.variant - product variant
 * @param params.region - region
 * @param params.includeTaxes - whether to include taxes or not
 */
export const computeVariantPrice = ({
  variant,
  region,
  includeTaxes = true,
}: ComputeVariantPriceParams) => {
  const amount = getVariantPrice(variant, region)

  return computeAmount({
    amount,
    region,
    includeTaxes,
  })
}

/**
 * Finds the price amount correspoding to the region selected
 * @param variant - the product variant
 * @param region - the region
 * @returns - the price's amount
 */
export const getVariantPrice = (
  variant: ProductVariantInfo,
  region: RegionInfo
) => {
  const price = variant?.prices?.find(
    (p) =>
      p.currency_code.toLowerCase() === region?.currency_code?.toLowerCase()
  )

  return price?.amount || 0
}

type ComputeAmountParams = {
  amount: number
  region: RegionInfo
  includeTaxes?: boolean
}

/**
 * Takes an amount, a region, and returns the amount as a decimal including or excluding taxes
 */
export const computeAmount = ({
  amount,
  region,
  includeTaxes = true,
}: ComputeAmountParams) => {
  const toDecimal = convertToDecimal(amount, region)

  const taxRate = includeTaxes ? getTaxRate(region) : 0

  const amountWithTaxes = toDecimal * (1 + taxRate)

  return amountWithTaxes
}

type FormatAmountParams = {
  amount: number
  region: RegionInfo
  includeTaxes?: boolean
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

/**
 * Takes an amount and a region, and converts the amount to a localized decimal format
 */
export const formatAmount = ({
  amount,
  region,
  includeTaxes = true,
  ...rest
}: FormatAmountParams) => {
  const taxAwareAmount = computeAmount({
    amount,
    region,
    includeTaxes,
  })
  return convertToLocale({
    amount: taxAwareAmount,
    currency_code: region.currency_code,
    ...rest,
  })
}

// we should probably add a more extensive list
const noDivisionCurrencies = ["krw", "jpy", "vnd"]

const convertToDecimal = (amount: number, region: RegionInfo) => {
  const divisor = noDivisionCurrencies.includes(
    region?.currency_code?.toLowerCase()
  )
    ? 1
    : 100

  return Math.floor(amount) / divisor
}

const getTaxRate = (region?: RegionInfo) => {
  return region && !isEmpty(region) ? region?.tax_rate / 100 : 0
}

const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-US",
}: ConvertToLocaleParams) => {
  return currency_code && !isEmpty(currency_code)
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency_code,
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(amount)
    : amount.toString()
}

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}
