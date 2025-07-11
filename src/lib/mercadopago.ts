import mercadopago from 'mercadopago'

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export const createSubscription = async (
  email: string,
  planType: 'monthly' | 'yearly'
) => {
  const planId = planType === 'monthly' ? 'plan_monthly_490' : 'plan_yearly_3990'
  const amount = planType === 'monthly' ? 4.90 : 39.90

  try {
    const subscription = await mercadopago.preapproval.create({
      reason: `FinançasGO - Plano ${planType === 'monthly' ? 'Mensal' : 'Anual'}`,
      payer_email: email,
      back_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?payment=success`,
      external_reference: `user_${email}_${planType}`,
      auto_recurring: {
        frequency: 1,
        frequency_type: planType === 'monthly' ? 'months' : 'years',
        transaction_amount: amount,
        currency_id: 'BRL',
      },
    })

    return subscription.body
  } catch (error) {
    console.error('Erro ao criar assinatura:', error)
    throw error
  }
}

export const cancelSubscription = async (subscriptionId: string) => {
  try {
    const response = await mercadopago.preapproval.update({
      id: subscriptionId,
      status: 'cancelled',
    })
    return response.body
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error)
    throw error
  }
}

export const getSubscriptionStatus = async (subscriptionId: string) => {
  try {
    const response = await mercadopago.preapproval.get({
      id: subscriptionId,
    })
    return response.body
  } catch (error) {
    console.error('Erro ao buscar status da assinatura:', error)
    throw error
  }
}

export default mercadopago
