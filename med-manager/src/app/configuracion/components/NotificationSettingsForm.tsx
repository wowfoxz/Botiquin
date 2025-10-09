'use client';

import { useState } from 'react';
import { updateNotificationSettings } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { notificationSettingsSchema, type NotificationSettingsFormData } from '@/lib/validations';
import { toast } from 'sonner';

interface NotificationSettingsFormProps {
  daysBeforeExpiration: number;
  lowStockThreshold: number;
}

export default function NotificationSettingsForm({ 
  daysBeforeExpiration, 
  lowStockThreshold 
}: NotificationSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<NotificationSettingsFormData>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      daysBeforeExpiration: daysBeforeExpiration.toString(),
      lowStockThreshold: lowStockThreshold.toString(),
    },
  });

  const onSubmit = async (data: NotificationSettingsFormData) => {
    setIsLoading(true);

    try {
      // Crear FormData para mantener compatibilidad con la acción del servidor
      const formData = new FormData();
      formData.append('daysBeforeExpiration', data.daysBeforeExpiration);
      formData.append('lowStockThreshold', data.lowStockThreshold);

      // Llamar a la acción del servidor
      await updateNotificationSettings(formData);
      
      toast.success('Configuración actualizada exitosamente');
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      toast.error('Error al actualizar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-sm border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl font-bold text-foreground">
          Notificaciones
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Configura cuándo deseas recibir alertas sobre tus medicamentos
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="daysBeforeExpiration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Avisar de vencimiento (días antes)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="365"
                      className="bg-background border-input"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lowStockThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Avisar de stock bajo (cantidad)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      className="bg-background border-input"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
