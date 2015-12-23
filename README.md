# columnizer
Core Javascript Columnizer

Columnizer is a script based on Core Javascript that splits HTML-code into columns (separate DIVs) with no help of CSS. It does not use any third-party libraries (i.e. jQuery), thus leaving a smaller footprint and making your site loading faster.


How to use

Download Columnizer and import it in your HTML.

Launch Columnizer by a simple statement:
document.getElementById('from').dbabych_columnize(params);

  where:
  document.getElementById('from') — block, containing HTML to be split into columns
  params — object with parameters
  

Parameters

width — column width in pixels
height — column height in pixels
col_class — css class name to be added to each column
cols_block_obj — container of columns stream to be managed in function done_func()
done_func — function to be launched after colmnizing complete
target — container to insert processed columns in
