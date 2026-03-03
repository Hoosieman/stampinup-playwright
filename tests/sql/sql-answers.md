# SQL Interview Questions & Answers

## Question 1: Find Failed Orders in Last 30 Days

**Question:** Given an Orders table with columns OrderId, CustomerId, OrderDate, Status, and Total, write a query to find all orders placed in the last 30 days with a status of 'Failed'.

**My Answer:**
```sql
SELECT OrderId, CustomerId, OrderDate, Status, Total
FROM Orders
WHERE Status = 'Failed'
  AND OrderDate >= DATEADD(DAY, -30, GETDATE());
```

I needed to filter on two conditions, the status must be failed and the order date must be within the last 30 days. I used `DATEADD` to get 30 days ago from today's date with `GETDATE()`.

---

## Question 2: Join Customers and Orders Over $100

**Question:** Given a Customers table (CustomerId, Name, Email) and the Orders table above, write a query that returns the customer name, email, and order total for all orders over $100.

**My Answer:**
```sql
SELECT c.Name, c.Email, o.Total
FROM Customers c
INNER JOIN Orders o ON c.CustomerId = o.CustomerId
WHERE o.Total > 100;
```

I used an `INNER JOIN` to join customers with their orders based on the CustomerId foreign key relationship. I filtered with `WHERE o.Total > 100` to only show orders over $100. This means only customers who have placed orders over $100 will appear in the result.

---

## Question 3: Count Orders Per Customer (Including Zero)

**Question:** Using the same tables, write a query that returns how many orders each customer has placed. Include customers who have placed zero orders.

**My Answer:**
```sql
SELECT c.CustomerId, c.Name, c.Email, COUNT(o.OrderId) AS OrderCount
FROM Customers c
LEFT JOIN Orders o ON c.CustomerId = o.CustomerId
GROUP BY c.CustomerId, c.Name, c.Email;
```

Including all customers who have placed zero orders told me I needed a `LEFT JOIN` instead of `INNER JOIN`. The `LEFT JOIN` keeps all customers even if they have no matches. I used `COUNT(o.OrderId)` because it counts only non NULL values, so customers with no orders would correctly show 0.

---

## Question 4: Debug the Query

**Question:** Here's a query that's supposed to return all customers who have never placed an order, but it's returning zero rows even though we know some exist. What's wrong?

```sql
SELECT c.Name, c.Email
FROM Customers c
LEFT JOIN Orders o ON c.CustomerId = o.CustomerId
WHERE o.Status = 'Completed';
```

**My Answer:** The `WHERE` is filtering out all customers who have never placed an order.

I saw that the `LEFT JOIN` is correct for including customers with no orders, their order columns would be NULL. But the `WHERE o.Status = 'Completed'` condition counts out any rows where `o.Status` is NULL. Since customers with no orders have NULL for all order columns, they get filtered out. This ends up behaving almost like an `INNER JOIN`.

**My correction:**
```sql
SELECT c.Name, c.Email
FROM Customers c
LEFT JOIN Orders o ON c.CustomerId = o.CustomerId
WHERE o.OrderId IS NULL;
```

After the `LEFT JOIN`, customers with no orders will have NULL values in all order columns. By checking `WHERE o.OrderId IS NULL`, I kept only the rows where no matching order were found, which gave me exactly the customers who have never placed an order.
