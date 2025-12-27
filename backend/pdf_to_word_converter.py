#!/usr/bin/env python3
"""
pdf_to_word_converter_v3.py - Professional PDF to Word Converter
Handles structured documents like payslips, invoices, and forms
with proper table layout and formatting preservation.

Usage:
    python pdf_to_word_converter_v3.py <input.pdf> <output.docx>

Requirements:
    pip install pdfplumber python-docx
"""

import sys
import pdfplumber
from docx import Document
from docx.shared import Pt, Cm, Inches, RGBColor, Twips
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import nsdecls
from docx.oxml import parse_xml


def set_cell_shading(cell, color="D9E2F3"):
    """Set background color for a cell"""
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)


def set_table_borders(table, color="000000", size="4"):
    """Set borders for entire table"""
    tbl = table._tbl
    tblPr = tbl.tblPr
    if tblPr is None:
        tblPr = parse_xml(f'<w:tblPr {nsdecls("w")}/>')
        tbl.insert(0, tblPr)
    
    # Remove existing borders if any
    for child in list(tblPr):
        if 'tblBorders' in child.tag:
            tblPr.remove(child)
    
    tblBorders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="{size}" w:color="{color}"/>'
        f'<w:left w:val="single" w:sz="{size}" w:color="{color}"/>'
        f'<w:bottom w:val="single" w:sz="{size}" w:color="{color}"/>'
        f'<w:right w:val="single" w:sz="{size}" w:color="{color}"/>'
        f'<w:insideH w:val="single" w:sz="{size}" w:color="{color}"/>'
        f'<w:insideV w:val="single" w:sz="{size}" w:color="{color}"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(tblBorders)


def is_amount(text):
    """Check if text is a numeric amount"""
    if not text:
        return False
    text = str(text).strip()
    # Remove common number formatting
    cleaned = text.replace(',', '').replace('.', '').replace('-', '').replace('/', '').replace(' ', '')
    # Check if mostly digits
    if not cleaned:
        return False
    return cleaned.isdigit() or text in ['0.00', '0', '0.0']


def is_header_text(text):
    """Check if text is a header/label"""
    if not text:
        return False
    text = str(text).strip()
    header_keywords = [
        'Employee', 'Date', 'Designation', 'Location', 'Bank', 'PF', 'ESI',
        'Earnings', 'Deductions', 'Amount', 'Particulars', 'Total', 'Gross',
        'Net', 'Income', 'Tax', 'Basic', 'HRA', 'Allowance', 'Provident',
        'Monthly', 'Year to Date', 'Arrear', 'Details', 'Calculation',
        'DETAILS', 'BASIC', 'Cumulative', 'Projected', 'Exempted', 'Annual'
    ]
    return any(kw.lower() in text.lower() for kw in header_keywords)


def detect_table_type(table_data):
    """Detect the type of table based on content"""
    if not table_data or not table_data[0]:
        return 'unknown'
    
    first_row_text = ' '.join(str(c or '') for c in table_data[0]).lower()
    
    if 'employee' in first_row_text and ('id' in first_row_text or 'name' in first_row_text):
        return 'employee_info'
    elif 'earnings' in first_row_text and 'deductions' in first_row_text:
        return 'earnings_deductions'
    elif 'provident fund' in first_row_text or 'pf' in first_row_text:
        return 'pf_details'
    elif 'income tax' in first_row_text or 'tax calculation' in first_row_text:
        return 'tax_calculation'
    elif 'hra' in first_row_text and 'calculation' in first_row_text:
        return 'hra_calculation'
    elif 'perquisite' in first_row_text:
        return 'perquisite'
    elif 'gross total' in first_row_text or 'net taxable' in first_row_text:
        return 'tax_summary'
    else:
        return 'generic'


def convert_pdf_to_word(pdf_path, docx_path):
    """
    Convert PDF to Word with professional formatting.
    Preserves table structure, applies proper styling.
    """
    doc = Document()
    
    # Set page margins (narrow for professional documents)
    for section in doc.sections:
        section.top_margin = Cm(1.0)
        section.bottom_margin = Cm(1.0)
        section.left_margin = Cm(1.2)
        section.right_margin = Cm(1.2)
        section.page_width = Inches(8.27)  # A4
        section.page_height = Inches(11.69)
    
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages):
            if page_num > 0:
                doc.add_page_break()
            
            # Extract page text for headers and special content
            page_text = page.extract_text() or ''
            
            # Try multiple table extraction strategies
            table_settings = [
                {"vertical_strategy": "lines", "horizontal_strategy": "lines", "snap_tolerance": 3},
                {"vertical_strategy": "lines_strict", "horizontal_strategy": "lines_strict"},
                {"vertical_strategy": "text", "horizontal_strategy": "text", "snap_tolerance": 5},
            ]
            
            tables = []
            for settings in table_settings:
                try:
                    tables = page.extract_tables(settings)
                    if tables and any(t and len(t) > 1 for t in tables):
                        break
                except:
                    continue
            
            # Add company header if found in first page
            if page_num == 0:
                # Check for company name in first few lines
                lines = page_text.split('\n')[:5]
                for line in lines:
                    line = line.strip()
                    if line and ('Limited' in line or 'Pvt' in line or 'Inc' in line or 'Corp' in line or 'LLC' in line):
                        header = doc.add_paragraph()
                        run = header.add_run(line)
                        run.bold = True
                        run.font.size = Pt(14)
                        run.font.name = 'Arial'
                        header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
                        doc.add_paragraph()
                        break
            
            # Process tables
            for table_idx, table_data in enumerate(tables):
                if not table_data:
                    continue
                
                # Clean empty rows
                table_data = [
                    row for row in table_data 
                    if row and any(cell and str(cell).strip() for cell in row)
                ]
                
                if not table_data:
                    continue
                
                num_rows = len(table_data)
                num_cols = max(len(row) for row in table_data if row)
                
                if num_cols == 0 or num_rows == 0:
                    continue
                
                # Detect table type
                table_type = detect_table_type(table_data)
                
                # Create Word table
                word_table = doc.add_table(rows=num_rows, cols=num_cols)
                word_table.alignment = WD_TABLE_ALIGNMENT.CENTER
                set_table_borders(word_table)
                
                # Process each cell
                for i, row in enumerate(table_data):
                    if not row:
                        continue
                    
                    for j, cell_value in enumerate(row):
                        if j >= num_cols:
                            continue
                        
                        cell = word_table.cell(i, j)
                        text = str(cell_value).strip() if cell_value else ''
                        cell.text = text
                        
                        # Get paragraph for styling
                        para = cell.paragraphs[0]
                        para.paragraph_format.space_before = Pt(1)
                        para.paragraph_format.space_after = Pt(1)
                        
                        # Determine styling based on position and content
                        is_first_row = (i == 0)
                        is_label_col = (j == 0) or (j == 2 and num_cols == 4)  # For 4-col tables
                        is_numeric = is_amount(text)
                        is_header = is_header_text(text)
                        
                        # Font size based on table complexity
                        font_size = 8 if num_cols > 6 else 9
                        
                        for run in para.runs:
                            run.font.size = Pt(font_size)
                            run.font.name = 'Arial'
                            
                            # Bold for headers and labels
                            if is_first_row or (is_label_col and not is_numeric) or is_header:
                                run.bold = True
                            
                            # Right align amounts
                            if is_numeric:
                                para.alignment = WD_ALIGN_PARAGRAPH.RIGHT
                        
                        # Header row shading
                        if is_first_row:
                            set_cell_shading(cell, "E2EFDA")  # Light green
                        elif is_header and not is_first_row:
                            set_cell_shading(cell, "F5F5F5")  # Light gray
                
                # Add spacing after table
                spacer = doc.add_paragraph()
                spacer.paragraph_format.space_after = Pt(6)
            
            # Add special text sections (Payslip title, Net Pay, etc.)
            special_lines = [
                ('Payslip for the month', True, 11),
                ('Net Pay', True, 10),
            ]
            
            for keyword, bold, size in special_lines:
                if keyword in page_text:
                    for line in page_text.split('\n'):
                        if keyword in line:
                            para = doc.add_paragraph()
                            run = para.add_run(line.strip())
                            run.bold = bold
                            run.font.size = Pt(size)
                            run.font.name = 'Arial'
                            break
        
        # Add footer note if found
        if 'computer generated' in page_text.lower():
            footer = doc.add_paragraph()
            run = footer.add_run("Note: This is a computer generated statement and does not require authentication.")
            run.font.size = Pt(8)
            run.italic = True
            run.font.name = 'Arial'
    
    doc.save(docx_path)
    print("SUCCESS")
    return True


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python pdf_to_word_converter_v3.py <input.pdf> <output.docx>")
        sys.exit(1)
    
    try:
        convert_pdf_to_word(sys.argv[1], sys.argv[2])
    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)