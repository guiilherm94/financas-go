import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import mercadopago from '@/lib/mercadopago'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (body.type === 'subscription') {
      const subscriptionId = body.data.id
      
      if (!subscriptionId) {
        return NextResponse.json({ error: 'ID da assinatura não fornecido' }, { status: 400 })
      }

      const subscription = await mercadopago.preapproval.get({
        id: subscriptionId,
      })

      const subscriptionData = subscription.body

      const { data: dbSubscription, error: findError } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('mercadopago_subscription_id', subscriptionId)
        .single()

      if (findError || !dbSubscription) {
        console.error('Assinatura não encontrada no banco:', subscriptionId)
        return NextResponse.json({ error: 'Assinatura não encontrada' }, { status: 404 })
      }

      const { error: updateSubError } = await supabase
        .from('subscriptions')
        .update({
          status: subscriptionData.status,
        })
        .eq('mercadopago_subscription_id', subscriptionId)

      if (updateSubError) {
        console.error('Erro ao atualizar assinatura:', updateSubError)
        return NextResponse.json({ error: 'Erro ao atualizar assinatura' }, { status: 500 })
      }

      let userSubscriptionStatus: 'trial' | 'active' | 'cancelled' | 'expired' = 'trial'
      let subscriptionEndDate: string | null = null

      switch (subscriptionData.status) {
        case 'authorized':
          userSubscriptionStatus = 'active'
          const plan = subscriptionData.auto_recurring?.frequency_type === 'months' ? 'monthly' : 'yearly'
          const endDate = new Date()
          if (plan === 'monthly') {
            endDate.setMonth(endDate.getMonth() + 1)
          } else {
            endDate.setFullYear(endDate.getFullYear() + 1)
          }
          subscriptionEndDate = endDate.toISOString()
          break
        case 'cancelled':
          userSubscriptionStatus = 'cancelled'
          break
        case 'paused':
          userSubscriptionStatus = 'expired'
          break
        default:
          userSubscriptionStatus = 'trial'
      }

      const { error: updateUserError } = await supabase
        .from('users')
        .update({
          subscription_status: userSubscriptionStatus,
          subscription_plan: subscriptionData.auto_recurring?.frequency_type === 'months' ? 'monthly' : 'yearly',
          subscription_end_date: subscriptionEndDate,
        })
        .eq('id', dbSubscription.user_id)

      if (updateUserError) {
        console.error('Erro ao atualizar usuário:', updateUserError)
        return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 })
      }

      console.log(`Assinatura ${subscriptionId} atualizada para status: ${subscriptionData.status}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Erro no webhook:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
