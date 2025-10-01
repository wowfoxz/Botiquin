'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History } from 'lucide-react';
import { ShoppingList as ShoppingListType } from '../types';

interface ShoppingHistoryProps {
  shoppingLists: ShoppingListType[];
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
}

const ShoppingHistory: React.FC<ShoppingHistoryProps> = ({
  shoppingLists,
  showHistory,
  setShowHistory
}) => {
  return (
    <Dialog open={showHistory} onOpenChange={setShowHistory}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setShowHistory(true)}>
          <History className="mr-2 h-4 w-4" />
          Historial
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Historial de Listas de Compras</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          {shoppingLists.length > 0 ? (
            <div className="space-y-4">
              {shoppingLists.map((list) => (
                <Card key={list.id} className="shadow-md">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-foreground">{list.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(list.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          ${list.total.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {list.items.length} items
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay listas de compras guardadas</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ShoppingHistory;