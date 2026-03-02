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

**My thought process:** I need to filter on two conditions - the status must be 'Failed' and the order date must be within the last 30 days. I use `DATEADD` to calculate 30 days ago from today's date with `GETDATE()`.

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

**My thought process:** I use an `INNER JOIN` to combine customers with their orders based on the CustomerId foreign key relationship. Then I filter with `WHERE o.Total > 100` to only show orders exceeding $100. This means only customers who have placed orders over $100 will appear in my results.

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

**My thought process:** The key here is "include customers who have placed zero orders" - this tells me I need a `LEFT JOIN` instead of `INNER JOIN`. The `LEFT JOIN` keeps all customers even if they have no matching orders. I use `COUNT(o.OrderId)` specifically because it counts only non-NULL values, so customers with no orders will correctly show 0. If I used `COUNT(*)` instead, those customers would incorrectly show 1.

---

## Question 4: Debug the Query

**Question:** Here's a query that's supposed to return all customers who have never placed an order, but it's returning zero rows even though we know some exist. What's wrong?

```sql
SELECT c.Name, c.Email
FROM Customers c
LEFT JOIN Orders o ON c.CustomerId = o.CustomerId
WHERE o.Status = 'Completed';
```

**My Answer:** The `WHERE` clause is filtering out all customers who have never placed an order.

**My thought process:** I see that the `LEFT JOIN` is correct for including customers with no orders - their order columns would be NULL. But here's the problem: the `WHERE o.Status = 'Completed'` condition eliminates any rows where `o.Status` is NULL. Since customers with no orders have NULL for all order columns, they get filtered out. The query ends up behaving like an `INNER JOIN`.

**My corrected query:**
```sql
SELECT c.Name, c.Email
FROM Customers c
LEFT JOIN Orders o ON c.CustomerId = o.CustomerId
WHERE o.OrderId IS NULL;
```

After the `LEFT JOIN`, customers with no orders will have NULL values in all order columns. By checking `WHERE o.OrderId IS NULL`, I keep only the rows where no matching order was found - which gives me exactly the customers who have never placed an order.
