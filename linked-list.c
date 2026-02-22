#include <stdio.h>
#include <stdlib.h>

struct node{
    int data;
    struct node *next;
};

struct node *createList(int data) {
    struct node *tmp = (struct node *)malloc(sizeof(struct node));
    tmp->data = data;
    tmp->next = NULL;
    return tmp;
}

void insertEnd(struct node *head, int data) {
    while (head->next != NULL) {
        head = head->next;
    }
    struct node *tmp = (struct node *)malloc(sizeof(struct node));
    head->next = tmp;
    tmp->data = data;
    tmp->next = NULL;
}

void insertBeginning(struct node** head_ptr, int data) {
    struct node *tmp = malloc(sizeof(struct node));
    tmp->data = data;
    tmp->next = *head_ptr;
    *head_ptr = tmp;
}

void insertindex(struct node *head, int index, int data) {
    for (int i = 1; i < index; i++) {
        head = head->next;
    }
    struct node *tmp = (struct node *)malloc(sizeof(struct node));
    tmp->data = data;
    tmp->next = head->next;
    head->next = tmp;
}

void deleteEnd(struct node *head) {
    while ((head->next)->next != NULL) {
        head = head->next;
    }
    free(head->next);
    head->next = NULL;
}

void deleteBeginning(struct node** head_ptr) {
    struct node *tmp = *head_ptr;
    *(head_ptr) = (*(head_ptr))->next;
    free(tmp);
}

void delete(struct node* head, int index) {
    for (int i = 1; i < index; i++) {
        
        head = head->next;
    }
    struct node *deletednode = head->next;
    head->next = deletednode->next;
    free(deletednode);
}

int count(struct node* head) {
    int count = 1;
    while (head->next != NULL) {
        head = head->next;
        count++;
    }

    return count;
}

void display(struct node *head) {

    
    printf("%i ", head->data);
    while (head->next != NULL) {
        head = head->next;
        printf("%i ", head->data);
    }
    printf("\n");
}

void display_mem(struct node *head) {
    int count = 1;
    long prev = (long)head;
    while (head-> next != NULL) {
        printf("%d. %p   diff: %ld\n", count, head, prev - (long)head);
        count++;
        prev = (long)head;
        head = head->next;
    }
    printf("%d. %p  diff: %ld\n", count, head, prev - (long)head);
}


int main() {
    struct node *head = createList(3);
    printf("      createList: ");display(head);

    insertEnd(head, 4);
    printf("      insertEnd: "); display(head);
    insertEnd(head, 5);
    printf("      insertEnd: "); display(head);
    insertEnd(head, 6);
    printf("      insertEnd: "); display(head);



    insertBeginning(&head, 1);
    printf("insertBeginning: "); display(head);

    insertindex(head, 1, 2);
    printf("         insert: "); display(head);

    deleteEnd(head);
    printf("      deleteEnd: "); display(head);

    deleteBeginning(&head);
    printf("deleteBeginning: "); display(head);

    delete(head, 2);
    printf("         delete: "); display(head);

    int number = count(head);
    printf("          count: %i\n", number);

    display_mem(head);
}