# dmarc-reporter
Node.js script to format the DMARC Report XML files.


## How to Run

It requires Node.js.

1. Clone the repository.
2. Save your DMARC report XML files to the same directory.
3. Open a terminal and navigate to the directory.
4. Run "npm install" to install the required packages.
5. Run the script with the command: `node dmarc-reporter.js *.xml`.


## Sample Output



```
$ node dmarc-reporter.js report.xml                                                                                                                                                       master  ✭ ✱
┌─────────────────┬───────┬──────┬─────────────────────────────┬──────┬───────────────┬────────────────┬──────────────────────────────────┬─────────────┬─────────────┬────────────┬────────────┐
│ Source IP       │ Count │ SPF  │ SPF Domain                  │ DKIM │ DKIM Selector │ Header From    │ Envelope From                    │ Envelope To │ Reporter    │ Start Date │ End Date   │
├─────────────────┼───────┼──────┼─────────────────────────────┼──────┼───────────────┼────────────────┼──────────────────────────────────┼─────────────┼─────────────┼────────────┼────────────┤
│ 255.255.255.255 │ 1     │ pass │ outbound.sample.com         │ pass │ s1            │ sample.com     │ outbound.sample.com              │ hotmail.com │ Outlook.com │ 2024-03-25 │ 2024-03-26 │
├─────────────────┼───────┼──────┼─────────────────────────────┼──────┼───────────────┼────────────────┼──────────────────────────────────┼─────────────┼─────────────┼────────────┼────────────┤
│ 255.255.255.254 │ 1     │ pass │ outbound.sample.com         │ pass │ s1            │ sample.com     │ outbound.sample.com              │ hotmail.com │ Outlook.com │ 2024-03-25 │ 2024-03-26 │
├─────────────────┼───────┼──────┼─────────────────────────────┼──────┼───────────────┼────────────────┼──────────────────────────────────┼─────────────┼─────────────┼────────────┼────────────┤
│ 255.255.255.253 │ 1     │ pass │ outbound2.sample.com        │ fail │ s2            │ sample.com     │ outbound2.sample.com             │ outlook.jp  │ Outlook.com │ 2024-03-25 │ 2024-03-26 │
└─────────────────┴───────┴──────┴─────────────────────────────┴──────┴───────────────┴────────────────┴──────────────────────────────────┴─────────────┴─────────────┴────────────┴────────────┘
```




## License
MIT